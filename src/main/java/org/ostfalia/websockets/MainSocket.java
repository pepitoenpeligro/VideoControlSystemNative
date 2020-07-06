package org.ostfalia.websockets;

import org.ostfalia.encoders.Message;
import org.ostfalia.encoders.MessageDecoder;
import org.ostfalia.encoders.MessageEncoder;

import javax.enterprise.context.ApplicationScoped;
import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint(value="/mainsocket",
        encoders = { MessageEncoder.class },
        decoders = { MessageDecoder.class })
@ApplicationScoped

public class MainSocket {

    private final Set<Session> sessions = new CopyOnWriteArraySet<Session>();
    private int clients = 0;


    Set<Session> getOposSession(Session s){
        Set<Session> local = new CopyOnWriteArraySet<>(sessions);
        local.remove(s);
        return local;
    }

    @OnOpen
    public void onOpen(Session session){

        sessions.add(session);
        clients++;
    }

    // Procesa que hay un nuevo usuario
    void onNewClient(Session s){
        sessions.add(s);

        System.out.println("[NewClient] Nuevo usuario");
        Message toCreatePeer = new Message(Json.createObjectBuilder().add("type", "CreatePeer").build());
        Message toFullSession = new Message(Json.createObjectBuilder().add("type", "SessionActive").build());


        System.out.println(".......procesando clientes" + clients);
        if (clients < 2) {
            if (clients == 1) {
                s.getAsyncRemote().sendObject(toCreatePeer);
                System.out.println("\t\t->" + toCreatePeer.getJson().toString());
            }
        }
        else{
            s.getAsyncRemote().sendObject(toFullSession);
            System.out.println("\t\t->" + toFullSession.getJson().toString());
        }
        clients++;

    }



    void onCandidate(Message r, Session sn){
        System.out.println("[onCandidate]");
        JsonObject candidate = r.getJson().getJsonObject("data");
        System.out.println("envio: " + candidate);
        getOposSession(sn).forEach(s-> s.getAsyncRemote().sendObject(candidate.toString()));
    }

    void onSdp(Message r, Session sn){
        System.out.println("[onSdp]");
        JsonObject sdp = r.getJson().getJsonObject("data");
        System.out.println("envio: " + sdp);
        getOposSession(sn).forEach(s-> s.getAsyncRemote().sendObject(sdp.toString()));
    }

    void onCloseResponse(Message r, Session s){
        System.out.println("[onCloseResponse]");
        try {
            s.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @OnMessage
    public void receiveMessage(String message, Session session) {
        try {
            Message r = new MessageDecoder().decode(message);
            System.out.println("[receiveMessage] ");
            System.out.println("\t-->" + r.getJson().toString());

            String response = new String(r.getJson().getString("type"));
            System.out.println(response);
            switch (response){
                case "sdp":
                    onSdp(r,session);
                    break;
                case "candidate":
                    onCandidate(r,session);
                    break;
                case "close":
                    onCloseResponse(r,session);
                    break;
            }
        } catch (DecodeException e) {
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose(Session session){
        try {
            System.out.println("[onClose] Un cliente menos :)");
            session.close();
            clients--;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
