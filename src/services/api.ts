

const base_url = process.env.REACT_APP_REST_API || ""

const non_versioned_api = ["signin","users"]

const is_versioned_api = (relative_url: string) => {
    for(let i = 0 ;i < non_versioned_api.length; i++){
        if (relative_url.includes(non_versioned_api[i])){
            return false;
        }
    }
    return true;
}
// 
const get = async(relative_url: string) => {

    let final_url = form_url(relative_url)
    let res = await fetch(final_url, {
        method: 'GET',
        credentials: "include",
        headers: {
           'Content-Type': 'application/json',
           //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
        }
     })
    
    return res.json()
}

const put = async(relative_url: string, body: any) => {

    let final_url = form_url(relative_url)
    let res = await fetch(final_url, {
        method: 'PUT',
        credentials: "include",
        headers: {
           'Content-Type': 'application/json',
           //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
        },
        body: JSON.stringify(body),
     })
    
    return res.json()
}

const post = async(relative_url: string, body: any) => {

    let final_url = form_url(relative_url)
    let res = await fetch(final_url, {
        method: 'POST',
        credentials: "include",
        headers: {
           'Content-Type': 'application/json',
           //Authorization: `Bearer ${process.env.REACT_APP_JWT}`,
        },
        body: JSON.stringify(body),
     })
    
    return res.json()
}

const post_external = async(url: string, body: any, header: any) => {
    let res = await fetch(url, {
        method: 'POST',
        credentials: "include",
        headers: header,
        body: JSON.stringify(body),
     })
    
    return res.json()
}

const form_url = (relative_url: string) => {
    let final_url = base_url
    if(is_versioned_api(relative_url)){
        final_url += `/${process.env.REACT_APP_API_VERSION}`
    }
    final_url += relative_url; //has the slash infront
    console.log(`final_url: ${final_url}`)
    return final_url
}

export {get , post, put, post_external}