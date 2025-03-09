import { UserRole } from "@prisma/client";

export const user = {
  role: "patient" as UserRole,
  name: "John Doe",
  email: "john.doe@example.com",
  institution_type_name: undefined,
  userProfile: {
    avatarUrl:
      "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=76&q=80",
  },
};
