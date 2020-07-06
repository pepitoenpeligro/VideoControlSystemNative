package org.ostfalia.encoders;


import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import java.util.logging.Logger;

public class MessageEncoder implements Encoder.Text<Message> {
    private static final Logger log = Logger.getLogger(MessageEncoder.class.getName());

    @Override
    public String encode(Message object) throws EncodeException {
        return object.getJson().toString();
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
