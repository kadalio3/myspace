'use client';

import { useState, useTransition } from 'react';
import { updateUser, deleteUser } from '@/lib/actions/user.actions';
import { Pencil, Trash2 } from 'lucide-react';

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
  };
  currentUserId: string;
}

export default function UserRow({ user, currentUserId }: UserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'GUEST'>(user.role as 'OWNER' | 'GUEST');

  const handleRoleChange = (newRole: 'OWNER' | 'GUEST') => {
    setRole(newRole);
    startTransition(async () => {
      try {
        await updateUser(user.id, { role: newRole });
      } catch (err: any) {
        alert(err.message || 'Failed to update role');
        setRole(user.role as 'OWNER' | 'GUEST');
      }
    });
  };

  const handleSaveAll = () => {
    setIsEditing(false);
    startTransition(async () => {
      try {
        const updateData: any = {
          name,
          email,
        };
        if (password.trim() !== '') {
          updateData.passwordHash = password.trim();
        }
        await updateUser(user.id, updateData);
        setPassword('');
      } catch (err: any) {
        alert(err.message || 'Failed to update user details');
        setName(user.name || '');
        setEmail(user.email || '');
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) return;
    startTransition(async () => {
      try {
        await deleteUser(user.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    });
  };

  const isSelf = user.id === currentUserId;

  return (
    <tr className="border-b border-slate-200 dark:border-zinc-800/60 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex-shrink-0 mt-1">
            {user.image ? (
              <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-600 dark:text-zinc-400">
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-300 dark:border-zinc-800 w-full max-w-sm shadow-sm">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 mb-0.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 mb-0.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 mb-0.5">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty to keep current"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button 
                    onClick={handleSaveAll}
                    disabled={isPending}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Save Changes</span>
                  </button>
                  <button 
                    onClick={() => { 
                      setIsEditing(false); 
                      setName(user.name || ''); 
                      setEmail(user.email || '');
                      setPassword('');
                    }}
                    className="text-xs bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">{user.name || 'No Name'}</span>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-lg"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Info</span>
                  </button>
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">{user.email}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="py-4 px-6 align-top pt-5">
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as 'OWNER' | 'GUEST')}
          disabled={isPending || isSelf}
          className={`bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all ${
            role === 'OWNER' 
              ? 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/10' 
              : 'text-slate-600 dark:text-zinc-400'
          } ${isSelf ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <option value="GUEST" className="bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300">GUEST</option>
          <option value="OWNER" className="bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-bold">OWNER</option>
        </select>
        {isSelf && <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-1">(Your Account)</span>}
      </td>

      <td className="py-4 px-6 text-right align-top pt-5">
        {!isSelf && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </td>
    </tr>
  );
}
