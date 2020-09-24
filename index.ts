import { Transaction } from "./src/transaction";

export class Instance {
	public save(): Promise<void> {
		return new Promise(resolve => resolve());
	}
}

export class Model {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public select(boh: boolean): Promise<Instance[]> {
		return new Promise(resolve => resolve([]));
	}
}

export class Sedentary {
	private connectionString: string;

	public constructor(connectionString: string) {
		this.connectionString = connectionString;
	}

	public model(): [Model, typeof Instance] {
		const instance = (function (this: {[key: string]: any}): void {
			this.a = "sisi";
			this.b = 2;
			console.log("almeno");
		} as any) as typeof Instance;
		Object.defineProperty(instance, "name", { value: "User" });

		const save = function (this: {[key: string]: any}): Promise<void> {
			return new Promise((resolve, reject) => {
				const save = (): void => reject(new Error("eh no"));
				Object.defineProperty(save, "name", { value: "User.save" });

				console.log(this.a);
				setTimeout(save, 10);
			});
		};
		Object.defineProperty(save, "name", { value: "User.save" });

		instance.prototype = new Instance();
		instance.prototype.constructor = instance;
		instance.prototype.save = save;

		const select: (boh: boolean) => Promise<Instance[]> = (boh: boolean) =>
			new Promise((resolve, reject) =>
				setTimeout(() => {
					if(boh) return resolve([new instance()]);
					reject(new Error("boh"));
				}, 10)
			);

		const model = {
			select,
		};

		return [model, (instance as any) as typeof Instance];
	}
}

const db = new Sedentary("gino");

const [Users, User] = db.model();

async function prova(): Promise<boolean> {
	try {
		console.log(await Users.select(true));

		const user = new User();

		await user.save();
	} catch(e) {
		console.log("però", e);
	}
	return true;
}

prova();
