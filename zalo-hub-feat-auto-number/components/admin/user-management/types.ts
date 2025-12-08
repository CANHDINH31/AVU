import { UserWithRole } from "@/lib/api/user";

export interface UserManagementProps {
  onBack: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

export interface NewUser {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface UserStatsProps {
  usersStats: {
    totalUsers: number;
    adminCount: number;
    managerCount: number;
    userCount: number;
    activeCount: number;
  };
  isLoading: boolean;
}

export interface UserSearchFiltersProps {
  searchTerm: string;
  pageSize: number;
  activeFilter?: number;
  roleFilter?: string;
  onSearchChange: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onActiveFilterChange: (value?: number) => void;
  onRoleFilterChange: (value?: string) => void;
}

export interface UserTableProps {
  users: UserWithRole[];
  isLoading: boolean;
  total: number;
  onEditUser: (user: UserWithRole) => void;
  onDeleteUser: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onChangePassword: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  isEditDialogOpen: boolean;
  selectedUser: UserWithRole | null;
  updateRoleMutation: any;
  deleteUserMutation: any;
  activateMutation: any;
  deactivateMutation: any;
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface UserRowProps {
  user: UserWithRole;
  onEdit: (user: UserWithRole) => void;
  onDelete: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDeactivate: (userId: string) => void;
  onChangePassword: (userId: string) => void;
  isEditDialogOpen: boolean;
  selectedUser: UserWithRole | null;
  updateRoleMutation: any;
  deleteUserMutation: any;
  activateMutation: any;
  deactivateMutation: any;
}

export interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newUser: NewUser;
  onNewUserChange: (user: NewUser) => void;
  onCreateUser: () => void;
  createUserMutation: any;
}

export interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole;
  selectedUser: UserWithRole | null;
  onSelectedUserChange: (user: UserWithRole) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  updateRoleMutation: any;
}

export interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onChangePassword: (userId: string, newPassword: string) => void;
  changePasswordMutation: any;
}
