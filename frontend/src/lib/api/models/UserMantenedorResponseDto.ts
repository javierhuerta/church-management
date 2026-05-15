export type UserMantenedorResponseDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  departments: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt?: string | null;
};
