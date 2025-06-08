import bcrypt from "bcrypt";
import { Collection, Db } from "mongodb";

interface IUserCred {
  _id: string;
  username: string;
  password: string;
}

export class CredentialsProvider {
  constructor(private db: Db, private collectionName: string) {}

  private get collection(): Collection<IUserCred> {
    return this.db.collection(this.collectionName);
  }

  async registerUser(username: string, password: string): Promise<boolean> {
    const existing = await this.collection.findOne({ _id: username });
    if (existing) {
      return false;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.collection.insertOne({
      _id: username,
      username,
      password: hashedPassword,
    });

    return true;
  }

  async verifyPassword(username: string, plainPassword: string): Promise<boolean> {
    const user = await this.collection.findOne({ _id: username });
    if (!user) return false;

    return await bcrypt.compare(plainPassword, user.password);
  }

  async verifyUser(username: string, password: string): Promise<boolean> {
    const user = await this.collection.findOne({ username });
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
    }

}
