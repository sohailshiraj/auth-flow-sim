// Sample TypeScript file to test linting and formatting
interface User {
  id: number;
  name: string;
  email: string;
}

class AuthService {
  private users: User[] = [];

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const newUser: User = {
      id: this.users.length + 1,
      ...userData,
    };

    this.users.push(newUser);
    return newUser;
  }

  async findUserById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}

export default AuthService;
