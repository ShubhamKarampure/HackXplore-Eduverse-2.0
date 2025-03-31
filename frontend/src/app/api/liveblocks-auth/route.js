import { Liveblocks } from "@liveblocks/node";
import { getCurrentUser } from "@/api/authApi";

const liveblocks = new Liveblocks({
  secret: "sk_dev_2pRQU8dieDRku1jccoz4PZgYwY1NtWcDMGvQYUNPu-4tUezjnpc5f9bdyrhpx2qp",
});

export async function POST(request) {
    // Get the current user from your database
  const user = getCurrentUser();
  console.log(user)

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(
    user.id,
    { userInfo: user.firstName } 
  );

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  session.allow(`${user.organization}:*`, session.READ_ACCESS);
  session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}