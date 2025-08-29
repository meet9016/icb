import { error } from "console";

export interface ErrorMsg {
    login: string;

}

// Define and export the API endpoint object
const showMsg: ErrorMsg = {
    login: 'Login successfully!',

};

export default showMsg;
