import bcrypt from "bcrypt";

export class CredentialService {
    async comparePassword(userPassword: string, passwordHash: string) {
        const isMatch = await bcrypt.compare(userPassword, passwordHash);
        return isMatch;
    }
}
