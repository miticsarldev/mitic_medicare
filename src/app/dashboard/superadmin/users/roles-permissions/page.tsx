import React from 'react';

// Données statiques des utilisateurs
const users = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'super_admin',
  },
  {
    id: '2',
    name: 'Marie Curie',
    email: 'marie.curie@example.com',
    role: 'hospital_admin',
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    role: 'independent_doctor',
  },
  {
    id: '4',
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    role: 'hospital_doctor',
  },
  {
    id: '5',
    name: 'Lucie Bernard',
    email: 'lucie.bernard@example.com',
    role: 'patient',
  },
];

export default function RolesPermissionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Rôles et Permissions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    defaultValue={user.role}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="hospital_admin">Hospital Admin</option>
                    <option value="independent_doctor">Independent Doctor</option>
                    <option value="hospital_doctor">Hospital Doctor</option>
                    <option value="patient">Patient</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Sauvegarder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}