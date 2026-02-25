import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Professional Database Configuration and Management
 * Follows Singleton pattern and implements robust connection handling.
 */
export class Mongo {
	constructor(uri, dbName) {
		// this.client = null;
		this.client = new MongoClient(uri);
		this.db = null;
		this.dbName = dbName;
		this.uri = uri
		this.isConnected = false
	}

	async connect() {
		if (this.isConnected) return
		await this.client.connect()
		this.isConnected = true
	}

	async getDb() {
		if (!this.isConnected) await this.connect()
		this.db = this.client.db(this.dbName)
		return this.db
	}

	async getCollection(collectionName) {
		if (!this.db || !this.isConnected) await this.getDb()
		return this.db.collection(collectionName)
	}

	async close() {
		if (this.isConnected) {
			await this.client.close()
			this.isConnected = false
		}
	}


}