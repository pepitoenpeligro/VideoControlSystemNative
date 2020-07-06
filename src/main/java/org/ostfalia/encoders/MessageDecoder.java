package org.ostfalia.encoders;

import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;
import java.io.StringReader;
import java.util.logging.Logger;

public class MessageDecoder implements Decoder.Text<Message> {
    private static final Logger log = Logger.getLogger(MessageDecoder.class.getName());
    @Override
    public Message decode(String s) throws DecodeException {
        JsonObject json = Json.createReader(new StringReader(s)).readObject();
        return new Message(json);
    }

    @Override
    public boolean willDecode(String s) {
        try{
            Json.createReader(new StringReader(s)).readObject();
            return true;
        }catch(Exception e){
            log.info(e.getMessage());
            return false;
        }
    }

    @Override
    public void init(EndpointConfig config) {
        log.info("init");
    }

    @Override
    public void destroy() {
        log.info("destroy");
    }
}

