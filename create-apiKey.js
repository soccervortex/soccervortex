const fs = require('fs');
const filePath = 'apiKeys.json';

// Check if apiKeys.json exists, if not create it
if (!fs.existsSync(filePath)) {
    const defaultKeys = [
        '1d171366cdf64118b495dba4cf37603f', // Key 1
        '620d6010eacd446298471d289a362f9f', // Replace with actual API key
        '38e25927fb9c4b7c8f19dc124e21b3e2', // Replace with actual API key
        'eb658a2df4cc47cfb0b54f118f8961cc', // Replace with actual API key
        '64b243f8bc7f469cacb987d5bbb2333e', // Replace with actual API key
        'd278ac50d0f2454dacebd6e4668d252e', // Replace with actual API key
        'b060899c58594b588e39b55e6bc0f381', // Replace with actual API key
        '8d93e7ae96994178b810cf320b8b94a0', // Replace with actual API key
        '6d5ca969981046999ac2289bda7480e4', // Replace with actual API key
        'af4fb0ab26b643c8b69801a7c81f5062', // Replace with actual API key
        '6e11d26d54d74bc0b1bcedfe861a8ba1', // Key 1
        '3a1d1a3ec99f4336a9c0b1caf8cab827', // Replace with actual API key
        'c4b0b8fd9c974f0e83bfe35b94c23fa5', // Replace with actual API key
        '4acc113ba36e4e38b1c2cd9b6ad57595', // Replace with actual API key
        'ffdd3c66e958472b889010e4bddaf682', // Replace with actual API key
        '9f5df27b0446477d830c60bb48f30c82', // Replace with actual API key
        '8b4436052ce14ce491f2e1cca6fabfb4', // Replace with actual API key
        'e2f6b32c68384ead9afca9b776594bd0', // Replace with actual API key
        '19314b1b0f1b4dc08ded171fd4b91ae2', // Replace with actual API key
        'e34e4cc747e843de949c7fb48ebc3fdf', // Replace with actual API key
        '3101f59f9ed442c39617e3b9c890bdac', // Key 1
        'f3b591096353492d8316129d930165c3', // Replace with actual API key
        'c9caf1db997a49cc9ad08fc5054cecf9', // Replace with actual API key
        '3d24370ae71445ed8fb4b0f19424a7c3', // Replace with actual API key
        'a3249f8fea604b2886def73e7d199625', // Replace with actual API key
        'bb8a48869d3a4681be57be06a287f52e', // Replace with actual API key
        'aaa7f1a514a346e5a183fc81293cffe0', // Replace with actual API key
        'cf8cb02202c9469e85d6ac3f3f08259d', // Replace with actual API key
        '659eb30d53274517a00a76ae2590d60e', // Replace with actual API key
        '8281e53276f94ab0ba4ce67bd6218007' // Replace with actual API key
    ];

    fs.writeFileSync(filePath, JSON.stringify(defaultKeys, null, 2), 'utf8');
    console.log('apiKeys.json file created with default keys');
} else {
    console.log('apiKeys.json already exists');
}
