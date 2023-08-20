import { Account, Avatars, Client } from 'appwrite';

// export const SsrHostname: string = 'qwik.ssr.almostapps.eu';
// export const AppwriteHostname: string = 'appwrite.qwik.ssr.almostapps.eu';
export const SsrHostname: string = 'localhost';
export const AppwriteHostname: string = 'localhost';

// export const AppwriteEndpoint = 'https://appwrite.qwik.ssr.almostapps.eu/v1';
export const AppwriteEndpoint = 'http://localhost/v1';
export const AppwriteProject = '647af6d86045f264979f';

const client = new Client();
client.setEndpoint(AppwriteEndpoint).setProject(AppwriteProject);

const account = new Account(client);
const avatars = new Avatars(client);

export const AppwriteService = {
	signOut: async () => {
		await account.deleteSession('current');
	},
	getAccount: async () => {
		return await account.get<any>();
	},
	getAccountPicture: (name: string) => {
		return avatars.getInitials(name.split("").reverse().join(""), 256, 256).toString();
	},
	setSession: (hash: string) => {
		const authCookies: any = {};
		authCookies['a_session_' + AppwriteProject] = hash;
		client.headers['X-Fallback-Cookies'] = JSON.stringify(authCookies);
	}
};