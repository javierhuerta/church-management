export type CreateUserMantenedorDto = {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentIds?: string[];
};
