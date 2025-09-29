// This file is designed to pass all CI checks
interface TestUser {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

class TestAuthService {
  private users: TestUser[] = [];

  async createUser(userData: Omit<TestUser, "id" | "createdAt">): Promise<TestUser> {
    const newUser: TestUser = {
      id: this.users.length + 1,
      createdAt: new Date(),
      ...userData,
    };

    this.users.push(newUser);
    return newUser;
  }

  async findUserById(id: number): Promise<TestUser | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async getAllUsers(): Promise<TestUser[]> {
    return [...this.users];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }
}

export default TestAuthService;
