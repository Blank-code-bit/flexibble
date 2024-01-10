import { auth, config, connector, graph } from "@grafbase/sdk";

const g = graph.Standalone();

const pg = connector.Postgres("pg", {
  url: g.env("POSTGRES_URL"),
});

//@ts-ignore
const User = g
  .model("User", {
    name: g.string().length({ min: 2, max: 100 }),
    email: g.string().unique(),
    avatarUrl: g.url(),
    description: g.string().length({ min: 2, max: 1000 }).optional(),
    githubUrl: g.url().optional(),
    linkedinUrl: g.url().optional(),
    projects: g
      .relation(() => Project)
      .list()
      .optional(),
  })
  .auth((rules) => {
    rules.public().read();
  });

//@ts-ignore
const Project = g
  .model("Project", {
    title: g.string().length({ min: 3 }),
    description: g.string(),
    image: g.url(),
    liveSiteUrl: g.url(),
    githubUrl: g.url(),
    category: g.string().search(),
    createdBy: g.relation(() => User),
  })
  .auth((rules) => {
    rules.public().read();
    rules.private().create().delete().update();
  });

const jwt = auth.JWT({ issuer: "grafbase", secret: g.env("NEXT_AUTH_SECRET") });

g.datasource(pg);

export default config({
  graph: g,
  auth: {
    providers: [jwt],
    rules: (rules) => rules.private(),
  },
  cache: {
    rules: [
      {
        types: ["Query"],
        maxAge: 60,
        staleWhileRevalidate: 60,
      },
    ],
  },
});
