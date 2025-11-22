'use client';
export default function Header({ user, onLogout }: any) {
  return (
    <nav className="bg-white shadow p-4 flex justify-between">
      <h1 className="text-xl font-bold">CommentIQ</h1>
      <button onClick={onLogout} className="text-blue-600">Logout</button>
    </nav>
  );
}
