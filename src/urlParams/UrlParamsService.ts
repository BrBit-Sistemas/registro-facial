export default class UrlParamsService {

    public injectUrlParams(urlParams: Record<string, unknown>): string {

        if (typeof urlParams !== 'object')
            throw new Error('Invalid URL parameters. Expected an object.')

        const params = Object.keys(urlParams).map(key => {
            if(urlParams[key] === null || typeof urlParams[key] === 'undefined'){

              return;
            }else{

              return `${encodeURIComponent(key)}=${encodeURIComponent(String(urlParams[key]))}`
            }

          } )
          
          return `?${params.filter(p => p).join('&')}`

    }

}