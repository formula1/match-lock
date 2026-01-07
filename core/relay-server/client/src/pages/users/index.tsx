
import { useState } from "react";
import { RELAY_API } from "../../globals/api";
import { useUser } from "../../globals/user";
import { usePromisedMemo } from "../../utils/promised-memo";
import { RunnableState, useRunnable } from "../../utils/runnable";
import { Forbidden } from "../error/forbidden";

export function Users() {
  const { user } = useUser();
  const users = usePromisedMemo(!user ? null : async ()=>{
    return RELAY_API.users.list({ authToken: user.token });
  }, [user]);

  if(!user) return <Forbidden />;

  return (
    <div>
      <h1>Users</h1>
      <CreateUser updateUsers={users.update} />
      {(()=>{
        switch(users.status){
          case "not-run": return <div>Loading...</div>;
          case "pending": return <div>Loading...</div>;
          case "failed": return (
            <div>
              <div>Error</div>
              <pre>{JSON.stringify(users.error, null, 2)}</pre>
            </div>
          );
          case "success": return (
            <UsersTable
              users={users.value}
              updateUsers={users.update}
            />
          );
        }
      })()}
    </div>
  );
}

function CreateUser({ updateUsers }: { updateUsers: ()=>void }) {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const createResult = useRunnable(async ()=>{
    if(!user) throw new Error("Not logged in");
    const result = await RELAY_API.users.create({ authToken: user.token }, { username });
    updateUsers();
    return result;
  })

  return (
    <>
    <div>
      <div>Create User <button onClick={updateUsers} >Refresh</button></div>
      <form
        onSubmit={async (e)=>{
          e.preventDefault();
          createResult.run();
        }}
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          disabled={createResult.state === RunnableState.PENDING}
        >Create</button>
      </form>
    </div>
    {createResult.state === RunnableState.FAILED && (
      <div>
        <div>Error</div>
        <pre>{JSON.stringify(createResult.error, null, 2)}</pre>
      </div>
    )}
    {createResult.state === RunnableState.SUCCESS && (
      <div>
        <div>Success</div>
        <div>Username: {createResult.value.username}</div>
        <div>Temporary Password: {createResult.value.temporaryPassword}</div>
      </div>
    )}
    </>
  );
}

function UsersTable(
  { users, updateUsers }: {
    users: Awaited<ReturnType<typeof RELAY_API.users.list>>,
    updateUsers: ()=>void
  }
){
  const { user } = useUser();
  const deleteResult = useRunnable(async (username: string)=>{
    if(!user) throw new Error("Not logged in");
    await RELAY_API.users.delete({ authToken: user.token }, { username });
    updateUsers();
  })

  return (
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Password Status</th>
          <th>Password Expires At</th>
          <th>Created At</th>
          <th>Password</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserItem key={user.username} user={user} updateUsers={updateUsers} />
        ))}
      </tbody>
    </table>
  )
}

function UserItem({ user, updateUsers }: {
  user: Awaited<ReturnType<typeof RELAY_API.users.list>>[number],
  updateUsers: ()=>void
}){
  const { user: authUser } = useUser();
  const resetPasswordResult = useRunnable(async ()=>{
    if(!authUser) throw new Error("Not logged in");
    return RELAY_API.users.reset({ authToken: authUser.token }, { username: user.username });
  })
  const deleteResult = useRunnable(async ()=>{
    if(!authUser) throw new Error("Not logged in");
    await RELAY_API.users.delete({ authToken: authUser.token }, { username: user.username });
    updateUsers();
  })
  if(!authUser) return null;
  if(deleteResult.state === RunnableState.PENDING) return null;
  return (
    <tr key={user.username}>
      <td>{user.username}</td>
      <td>{user.passwordStatus}</td>
      <td>{user.passwordExpiresAt || "-"}</td>
      <td>{user.createdAt}</td>
      <td>
        {resetPasswordResult.state === RunnableState.SUCCESS ? (
          <div>
            <div>Temporary Password: {resetPasswordResult.value.temporaryPassword}</div>
            <div>Expires At: {resetPasswordResult.value.expiresAt}</div>
            <div>
              <button
                onClick={async ()=>{ resetPasswordResult.run(); }}
              >Reset Password</button>
            </div>
          </div>
        ) : resetPasswordResult.state === RunnableState.PENDING ? (
          <div>Loading...</div>
        ) : resetPasswordResult.state === RunnableState.FAILED ? (
          <div>
            <div>Error</div>
            <div>
              <button
                onClick={async ()=>{ resetPasswordResult.run(); }}
              >Reset Password</button>
            </div>
          </div>
        ) : (
          <button
            onClick={async ()=>{ resetPasswordResult.run(); }}
          >Reset Password</button>
        )}
      </td>
      <td>
        <button
          onClick={async ()=>{ deleteResult.run(); }}
        >Delete</button>
      </td>
    </tr>
  )
}
