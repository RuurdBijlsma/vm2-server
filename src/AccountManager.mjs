import bcrypt from "bcrypt";
import Database from './Database.mjs';

class AccountManager {
    async register(username, password) {
        if (username === '' || password === '') return false;
        try {
            let hash = await this.hash(password);
            return await Database.registerUser(username, hash);
        } catch (e) {
            return false;
        }
    }

    async login(username, password) {
        try {
            let hash = await Database.passwordByUsername(username);
            let success = await this.passwordMatchesHash(password, hash.password);
            if (!success)
                return false;

            return await Database.userIdByName(username);
        } catch (e) {
            return false;
        }
    }

    async passwordMatchesHash(password, hash) {
        return new Promise((resolve, error) => {
            bcrypt.compare(password, hash, (err, res) => {
                if (err)
                    error(err);
                resolve(!!res);
            })
        })
    }

    hash(password) {
        return new Promise((resolve, error) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err)
                    error(err);
                resolve(hash);
            })
        })
    }
}

export default new AccountManager();
