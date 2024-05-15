/**
 * @description 根据url获取网站icon和title
 * @author Golu
 * @type {AxiosStatic | {AxiosResponseTransformer: AxiosResponseTransformer, AxiosRequestConfig: AxiosRequestConfig, AxiosResponseHeaders: RawAxiosResponseHeaders & AxiosHeaders, CanceledError: CanceledError, TransitionalOptions: TransitionalOptions, CancelTokenStatic: CancelTokenStatic, formToJSON(form: (GenericFormData | GenericHTMLFormElement)): object, HttpStatusCode: HttpStatusCode, FormSerializerOptions: FormSerializerOptions, Axios: Axios, all<T>(values: Array<Promise<T> | T>): Promise<T[]>, FormDataVisitorHelpers: FormDataVisitorHelpers, responseEncoding: "ascii" | "ASCII" | "ansi" | "ANSI" | "binary" | "BINARY" | "base64" | "BASE64" | "base64url" | "BASE64URL" | "hex" | "HEX" | "latin1" | "LATIN1" | "ucs-2" | "UCS-2" | "ucs2" | "UCS2" | "utf-8" | "UTF-8" | "utf8" | "UTF8" | "utf16le" | "UTF16LE", AxiosInterceptorOptions: AxiosInterceptorOptions, toFormData(sourceObj: object, targetFormData?: GenericFormData, options?: FormSerializerOptions): GenericFormData, Method: "get" | "GET" | "delete" | "DELETE" | "head" | "HEAD" | "options" | "OPTIONS" | "post" | "POST" | "put" | "PUT" | "patch" | "PATCH" | "purge" | "PURGE" | "link" | "LINK" | "unlink" | "UNLINK", ResponseType: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream", AxiosHeaders: AxiosHeaders, AxiosProgressEvent: AxiosProgressEvent, AxiosStatic: AxiosStatic, SerializerOptions: SerializerOptions, AxiosRequestTransformer: AxiosRequestTransformer, GenericAbortSignal: GenericAbortSignal, RawAxiosResponseHeaders: RawAxiosResponseHeaders, isAxiosError<T=any, D=any>(payload: any): payload is AxiosError<T, D>, AxiosHeaderValue: AxiosHeaders | string | string[] | number | boolean, AxiosRequestHeaders: RawAxiosRequestHeaders & AxiosHeaders, ParamsSerializerOptions: ParamsSerializerOptions, Canceler: Canceler, Cancel: Cancel, AxiosResponse: AxiosResponse, AxiosProxyConfig: AxiosProxyConfig, RawAxiosRequestHeaders: RawAxiosRequestHeaders, AxiosInstance: AxiosInstance, CancelTokenSource: CancelTokenSource, SerializerVisitor: SerializerVisitor, GenericFormData: GenericFormData, CreateAxiosDefaults: CreateAxiosDefaults, GenericHTMLFormElement: GenericHTMLFormElement, CancelToken: CancelToken, isCancel(value: any): value is Cancel, AxiosDefaults: AxiosDefaults, AxiosPromise: Promise<AxiosResponse<*>>, spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R, RawAxiosRequestConfig: AxiosRequestConfig<D>, InternalAxiosRequestConfig: InternalAxiosRequestConfig, HeadersDefaults: HeadersDefaults, AxiosInterceptorManager: AxiosInterceptorManager, ParamEncoder: ParamEncoder, AxiosError: AxiosError, CustomParamsSerializer: CustomParamsSerializer, AxiosBasicCredentials: AxiosBasicCredentials, CancelStatic: CancelStatic, AxiosAdapter: AxiosAdapter, readonly default: AxiosStatic} | axios.AxiosStatic | axios}
 */
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/LoggerTool');

/**
 * 解析网站
 * @param url
 * @returns {Promise<{title: string, icon: string}>}
 */
const parseUrlTool = async (url) => {
    try {
        const res = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (res.status === 200){
            const $ = cheerio.load(res.data);
            let title = $('title').text() || url.replace(/^https?:\/\//, '').replace(/\//g, '');
            const linkTag = $('head link[rel="shortcut icon"]');
            let icon = linkTag.attr('href') || 'favicon.ico';
            logger.info(`解析网站成功 -> `);
            logger.info(`title -> ${title}`);
            logger.info(`icon -> ${icon}`);
            if (!icon.startsWith('http')) {
                if (icon.startsWith('/'))
                    icon = url.replace(/\//g, '') + icon;
                else
                    icon = url.replace(/\//g, '') + '/' + icon;
            }
            return {
                title,
                icon
            };
        }else {
            logger.error('解析网站请求失败! 原因 ->');
            logger.error(res);
        }
    } catch (e) {
        logger.error('解析网站失败! 原因 ->');
        logger.error(e.message);
    }
}

module.exports = parseUrlTool;
