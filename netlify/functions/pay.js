/* Netlify-обёртка над paykeeper/index.js.

   Формат события у Netlify Functions тот же, что у Яндекс Cloud Functions
   (AWS Lambda proxy): event.httpMethod / queryStringParameters / headers /
   body / isBase64Encoded, ответ { statusCode, headers, body }. Поэтому
   обработчик переиспользуется как есть, без изменений.

   Адрес: https://<имя-сайта>.netlify.app/.netlify/functions/pay
   Логин/пароль PayKeeper и секретное слово — только в переменных окружения
   Netlify, в репозиторий они не попадают. */

module.exports.handler = require("../../paykeeper/index.js").handler;
