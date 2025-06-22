import { tool } from "ai";
import z from "zod";

/**
 * Calls the `gh` cli tool returning the json parsed result
 */
async function gh<TOut extends z.ZodTypeAny>(
  args: string[],
  schema: TOut,
): Promise<z.infer<TOut>> {
  const cmd = new Deno.Command("gh", { args });
  const { stdout } = await cmd.output();
  return schema.parse(JSON.parse(new TextDecoder().decode(stdout)));
}

/**
 * Gets the repo the user is currently in.
 */
async function getRepo() {
  return await gh(
    ["repo", "view", "--json", "nameWithOwner"],
    z.object({
      nameWithOwner: z.string(),
    }),
  );
}

async function getReviews(repoName: string, prNumber: number) {
  return await gh(
    ["api", `/repos/${repoName}/pulls/${prNumber}/reviews`],
    z.array(z.object({
      id: z.number(),
      body: z.string(),
      state: z.string(),
    })),
  );
}

async function getReviewComments(
  repoName: string,
  prNumber: number,
  reviewId: number,
) {
  const url =
    `/repos/${repoName}/pulls/${prNumber}/reviews/${reviewId}/comments`;
  return await gh(
    ["api", url],
    z.array(z.object({
      id: z.number(),
      diff_hunk: z.string(),
      body: z.string(),
    })),
  );
}

export default tool({
  description: "Get all the pull request review comments",
  parameters: z.object({
    prNumber: z.number().describe(
      "The pull request you want to get the review comments for",
    ),
  }),
  execute: async ({ prNumber }) => {
    const repo = await getRepo();
    const reviews = await getReviews(repo.nameWithOwner, prNumber);

    const reviewComments = await Promise.all(reviews.map(async (review) => {
      const comments = await getReviewComments(
        repo.nameWithOwner,
        prNumber,
        review.id,
      );

      return [
        `# Review ${review.id}`,
        "",
        review.body.trim(),
        "",
        ...comments.map((c) => {
          return [
            `## Comment ${c.id}`,
            "",
            "```diff",
            c.diff_hunk,
            "```",
            "",
            c.body.trim(),
          ].join("\n");
        }),
      ].join("\n");
    }));

    return reviewComments.join("\n");
  },
});
