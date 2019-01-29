import axios from 'axios'
import download from 'downloadjs'

var ServerRoot = 'http://demo1.imposition.com.tw/' // test: 'http://localhost:56245/' production: 'http://purchase.topcolor.com.tw:1680/'

function StoreAuthorizationToken (token) {
  let expiredDate = new Date()
  expiredDate.setDate(expiredDate.getDate() + 1)
  window.localStorage.setItem('bulk-purchase-authorization-token', token)
  window.localStorage.setItem('bulk-purchase-authorization-expire', expiredDate)
  // console.log(`store token: ${token} ${expiredDate}`)
}

function RetrieveAuthorizationToken () {
  let token = window.localStorage.getItem('bulk-purchase-authorization-token')
  let expiredDate = new Date(window.localStorage.getItem('bulk-purchase-authorization-expire'))
  if (token && expiredDate && expiredDate > new Date()) {
    // console.log(`retrieve token: ${token}`)
    return token || ''
  }
  // console.log('no token')
  return ''
}

function RetrieveConfig () {
  return {
    baseURL: `${ServerRoot}api/`,
    headers: {
      'content-type': 'application/json',
      'authorization': RetrieveAuthorizationToken()
    }
  }
}

export default {
  Config (contentType) {
    return RetrieveConfig(contentType)
  },
  RetrieveAuthorizationToken () {
    return RetrieveAuthorizationToken()
  },
  StoreAuthorizationToken (token) {
    StoreAuthorizationToken(token)
  },
  Get (url) {
    return axios.get(url, RetrieveConfig())
  },
  Post (url, data) {
    return axios.post(url, data, RetrieveConfig())
  },
  Put (url, data) {
    return axios.put(url, data, RetrieveConfig())
  },
  Patch (url, data) {
    return axios.patch(url, data, RetrieveConfig())
  },
  Delete (url, data) {
    let config = RetrieveConfig()
    config.data = data
    return axios.delete(url, config)
  },
  async Login (account, password) {
    let params = new URLSearchParams()
    params.append('grant_type', 'password')
    params.append('username', account)
    params.append('password', password)
    try {
      let res = await axios.post(`${ServerRoot}token`, params, RetrieveConfig())
      if (res.status === 200) {
        if (res.data.access_token) {
          StoreAuthorizationToken(`${res.data.token_type} ${res.data.access_token}`)
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },
  async Upload (url, formData, progressCallback) {
    let config = RetrieveConfig()
    config.headers['content-type'] = 'multipart/form-data'
    if (progressCallback) {
      config.onUploadProgress = function (progressEvent) {
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        progressCallback(percentCompleted)
      }
    }
    try {
      let res = await axios.post(url, formData, config)
      // return res.status // success === 201
      return res
    } catch (e) {
      return { status: 500 }
    }
  },
  async Download (url, responseType, accept, filename) {
    let config = RetrieveConfig()
    config.responseType = responseType
    config.headers.Accept = accept
    try {
      let res = await axios.get(url, config)
      if (res.status === 200) {
        download(res.data, filename)
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },
  async Download1 (url, data, responseType, accept, filename) {
    let config = RetrieveConfig()
    config.responseType = responseType
    config.headers.Accept = accept
    try {
      let res = await axios.post(url, data, config)
      if (res.status === 200) {
        download(res.data, filename)
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },
  async ForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }
}
