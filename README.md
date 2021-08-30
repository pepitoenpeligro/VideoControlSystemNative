# Video Control System Native project

![](images/videoConference.png)

The project consists of a basic video conference and text chat system (like skype o jitsi, but restricted to 2 clients), developed in a basic client-server architecture.

1. Based on the *video* tag of the HTML5 standard.
2. Based on **https**.
3. Real-time data exchange with **WebRTC** (video).
4. Use of Sockets (TCP, connection-oriented).
5. Using the **Quarkus** development framework.


### Video Demo

https://user-images.githubusercontent.com/14912971/131375400-f86cfc5d-5045-481f-bdb6-bd0fcb5f7240.mov

<!-- ![alt text](https://user-images.githubusercontent.com/14912971/86584847-d139c080-bf85-11ea-91cd-f9ad17d12939.png "Deployed!")
![alt text](https://user-images.githubusercontent.com/14912971/86584837-ce3ed000-bf85-11ea-832e-cec1acc10762.png "Calling from OS X to android Device") -->

### Android View

![](images/movil.jpg)

## Usage
To use it in local mode, just launch the server, running:
```
./mvn clean install quarkus:dev
```
And then launch two instances of https://localhost:443
from Google Chrome or Firefox

### Author: José Antonio Córdoba Gómez