const https = require('https');

function postRequest(body) {
    const options = {
        hostname: 'api.openai.com',
        path: '/v1/completions',
        method: 'POST',
        port: 443,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let rawData = '';

            res.on('data', chunk => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                } catch (err) {
                    reject(new Error(err));
                }
            });
        });

        req.on('error', err => {
            reject(new Error(err));
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

function getPrompt(event) {
    const sentiment = {
       1: 'a funny',
       2: 'a neutral',
       3: 'a loving',
       4: 'a witty',
       5: 'an unfriendly',
       6: 'an angry',
       7: 'a sad',
       8: 'a sarcastic',
    };

    const type = {
        1: 'birthday',
        2: 'leaving',
        3: 'wedding',
        4: 'new baby',
        5: 'christmas',
    };

    const relation = {
        1: 'my BFF',
        2: 'an acquaintance',
        3: 'a colleague',
        4: 'my boss',
        5: 'my mortal enemy',
        6: 'a complete stranger',
    };

    const qs = event['queryStringParameters'] || {};
    const prompt = `write ${sentiment[qs['sentiment']]} ${type[qs['type']]} card message for ${relation[qs['relation']]}`;

    return prompt;
}

exports.handler = async event => {
    try {
        const result = await postRequest({
            model: 'text-davinci-002',
            prompt: getPrompt(event),
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        console.log('result is: ', result);

        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'message': result['choices'][0]['text']}),
        };
    } catch (error) {
        console.log('Error is: ', error);
        return {
            statusCode: 400,
            body: error.message,
        };
    }
};
