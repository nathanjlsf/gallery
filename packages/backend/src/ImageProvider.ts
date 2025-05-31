import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
  _id: ObjectId;
  src: string;
  name: string;
  author?: ObjectId; 
}

interface IUserDocument {
  _id: ObjectId;
  username: string;
}

export interface IApiImageData {
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

    const authorIds = images
      .map(img => img.author)
      .filter((a): a is ObjectId => a instanceof ObjectId);

    const users = await this.userCollection
      .find({ _id: { $in: authorIds } })
      .toArray();

    const userMap = new Map<string, string>();
    for (const user of users) {
      userMap.set(user._id.toString(), user.username);
    }

    return images.map(img => {
      const authorIdStr = img.author instanceof ObjectId
        ? img.author.toString()
        : "";

      const username = img.author instanceof ObjectId
        ? userMap.get(authorIdStr) ?? "Unknown"
        : "Unknown";

      return {
        id: img._id.toString(),
        src: img.src,
        name: img.name,
        author: {
          id: authorIdStr,
          username,
        },
      };
    });
  }

  async getImages(name?: string): Promise<IApiImageData[]> {
    const query = name
      ? { name: { $regex: name, $options: "i" } }
      : {};
    const images = await this.imageCollection.find(query).toArray();

    const authorIds = images
      .map(img => img.author)
      .filter((a): a is ObjectId => a instanceof ObjectId);

    const users = await this.userCollection
      .find({ _id: { $in: authorIds } })
      .toArray();

    const userMap = new Map<string, string>();
    for (const user of users) {
      userMap.set(user._id.toString(), user.username);
    }

    return images.map(img => {
      const authorIdStr = img.author instanceof ObjectId
        ? img.author.toString()
        : "";

      const username = img.author instanceof ObjectId
        ? userMap.get(authorIdStr) ?? "Unknown"
        : "Unknown";

      return {
        id: img._id.toString(),
        src: img.src,
        name: img.name,
        author: {
          id: authorIdStr,
          username,
        },
      };
    });
  }

  async updateImageName(imageId: string, newName: string): Promise<number> {
    const result = await this.imageCollection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: { name: newName } }
    );
    return result.matchedCount;
  }
}
