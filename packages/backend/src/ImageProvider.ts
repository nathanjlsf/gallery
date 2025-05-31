import { MongoClient, Collection } from "mongodb";

interface IImageDocument {
  _id: string;
  src: string;
  name: string;
  author: string;
}

interface IUserDocument {
  _id: string;
  username: string;
}

interface IApiImageData {
  id: string;
  src: string;
  name: string;
  author: {
    id: string;
    username: string;
  };
}

export class ImageProvider {
  private imageCollection: Collection<IImageDocument>;
  private userCollection: Collection<IUserDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const db = this.mongoClient.db(process.env.DB_NAME);
    this.imageCollection = db.collection<IImageDocument>(process.env.IMAGES_COLLECTION_NAME!);
    this.userCollection = db.collection<IUserDocument>(process.env.USERS_COLLECTION_NAME!);
  }

  async getAllImages(): Promise<IApiImageData[]> {
    const images = await this.imageCollection.find().toArray();
    const authorIds = [...new Set(images.map((img) => img.author))];

    const users = await this.userCollection
      .find({ _id: { $in: authorIds } })
      .toArray();

    const userMap = new Map(users.map((user) => [user._id, user]));

    return images.map((img) => ({
      id: img._id,
      src: img.src,
      name: img.name,
      author: {
        id: img.author,
        username: userMap.get(img.author)?.username ?? "unknown",
      },
    }));
  }
}
