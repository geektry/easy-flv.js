# easy-flv.js

#### 1. Features

- Provide a easier way to use [Bilibili/flv.js](https://github.com/Bilibili/flv.js)
- Support simple statistics info outputted in console
- Automatic reload player when network is unstable

#### 2. Get Started

Please refer to [easy-flv-demo.html](https://github.com/geektry/easy-flv.js/blob/master/easy-flv-demo.html)

#### 3. Documents

##### 3.1 Configurations

```javascript
const easyFlvJs = new EasyFlvJs({
    parameter: value
});
```

Parameters

|Parameter                |Necessary|Type  |Default|Description|
|-------------------------|---------|------|-------|-----------|
|playVideoElementId       |M        |String|-      |The player `<video>` id|
|playUrlInputElementId    |M        |String|-      |The play url `<input>` id|
|playButtonElementId      |M        |String|-      |The play button `<button>` id|
|playButtonDisabledSeconds|O        |Number|2      |After the button been pressed, it will be disabled for `[N]`s to avoid play problems|
|taskCycleSeconds         |O        |Number|5      |The statistics info will be outputted in console every `[N]`s|
|maxReloadDelayCycles     |O        |Number|2      |If decoded frames do not increase after `[N]` cycles, the player will be reloaded|
|maxBufferedFrameSeconds  |O        |Number|5      |If number of buffered frame seconds is over than `[N]`s, the player will be reloaded|

##### 3.2 Methods

```javascript
easyFlvJs.method();
```

Methods

|Method     |Description|
|-----------|-----------|
|void init()|Init player with given configuration|
|void play()|Play live stream|
