import {authorizedUsers} from "../../authorizedUsersList";
import {UserModel} from "../models/user.model";
import {hashPassword} from "../../utils/hashPassword";
import {User} from "../../interfaces/user.interface";

export async function addUsersToDB () {
  const authorizedUserProperties = Object.entries(authorizedUsers);
  const newUsers: User[] = [];

  for (let [email, password] of authorizedUserProperties) {
    const hashedPassword = await hashPassword(password);

    if (await UserModel.exists({email: email}) === null) {
      newUsers.push({
        email,
        password: hashedPassword.hash,
        salt: hashedPassword.salt,
      })
    }
  }

  for (let user of newUsers) {
    await UserModel.create(user);
    console.log('user added');
  }
}