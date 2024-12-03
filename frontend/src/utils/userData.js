import backendIP from "./serverData";


export function checkUser(userid, password) {
    try {
        if (userid === "1234" && password === "1234")
            return true;
        else
            return false;
    } catch (error) {
        console.error(error);
    }
}

export async function AuthenticateUser(clientId, password) {

    const bdata = JSON.stringify({
        "userid": clientId,
        "password": password
    });

    // const podIP = backendIP();
    //    console.log(podIP);

    try {
        const response = await fetch((backendIP + "/login"), {
            "method": "POST",

            "headers": {
                "Accept": "application/json",
                "content-type": "application/json"
            },
            "body": bdata
        });

        const data = await response.json();
        // console.log(data);
        // callback(data)
        return data.status
    } catch (error) {
        console.log({ "err": error });
        return ""
    }
}