import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/lib/orpc/client';
// import { CreateUserForm } from './-components/create-user-form';
import { DeleteUserForm } from './-components/delete-user-form';
import { EditUserForm } from './-components/edit-user-form';

type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: Date;
};

export const Route = createFileRoute('/admin/user/')({
  component: RouteComponent,
  validateSearch: z.object({
    q: z.string().optional(),
    create: z.string().optional(),
    edit: z.string().optional(),
    delete: z.string().optional(),
  }).parse,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { create, edit, delete: deleteParam } = search;
  const [currentDeleteUser, setCurrentDeleteUser] =
    useState<UserListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  const { data: users, isLoading } = useQuery(
    orpc.admin.user.get.queryOptions({ input: {} })
  );
  const usersList =
    users?.data.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  useEffect(() => {
    if (deleteParam && users) {
      const user = users?.data?.find((u) => u.id === deleteParam);
      if (user) {
        setCurrentDeleteUser(user);
      }
    }
  }, [deleteParam, users]);

  const handleCreate = () => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        create: 'true',
        edit: undefined,
        delete: undefined,
      }),
    });
  };

  const handleEdit = (user: UserListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: user.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (user: UserListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: user.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  const closeModals = () => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        create: undefined,
        edit: undefined,
        delete: undefined,
      }),
    });
  };

  const renderContent = (() => {
    if (isLoading) {
      return (
        <div className="py-8 text-center text-gray-500">Loading users...</div>
      );
    }

    if (usersList.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No users found. {searchTerm && 'Try a different search term.'}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-sm">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-sm">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-sm">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-sm">
                Created At
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usersList.map((user: UserListItem) => {
              let roleClass = 'bg-gray-100 text-gray-800';
              if (user.role === 'admin') {
                roleClass = 'bg-purple-100 text-purple-800';
              } else if (user.role === 'viewer') {
                roleClass = 'bg-blue-100 text-blue-800';
              }

              return (
                <tr className="hover:bg-gray-50" key={user.id}>
                  <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${roleClass}`}
                    >
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded p-1 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(user)}
                        type="button"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(user)}
                        type="button"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  })();

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </div>
            {/* <Button onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Add User
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray-400" />
              <input
                className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  navigate({
                    to: '.',
                    search: (prev) => ({
                      ...prev,
                      q: e.target.value || undefined,
                    }),
                  });
                }}
                placeholder="Search users by name or email..."
                type="text"
                value={searchTerm}
              />
            </div>
          </div>

          {renderContent}
        </CardContent>
      </Card>

      {/* <CreateUserForm onOpenChange={closeModals} open={!!create} /> */}
      <EditUserForm
        onOpenChange={closeModals}
        open={!!edit}
        userId={edit || null}
      />
      <DeleteUserForm
        onOpenChange={closeModals}
        open={!!deleteParam}
        user={currentDeleteUser}
      />
    </div>
  );
}
