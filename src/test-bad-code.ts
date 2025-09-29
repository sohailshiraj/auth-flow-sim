// This file intentionally has formatting and linting issues to test our setup
interface BadUser {
  id: number;
  name: string;
  email: string;
}

class BadAuthService {
  private users: BadUser[] = [];

  async createUser(userData: Omit<BadUser, "id">): Promise<BadUser> {
    const newUser: BadUser = {
      id: this.users.length + 1,
      ...userData,
    };

    this.users.push(newUser);
    return newUser;
  }

  async findUserById(id: number): Promise<BadUser | undefined> {
    return this.users.find((user) => user.id === id);
  }
}

export default BadAuthService;
