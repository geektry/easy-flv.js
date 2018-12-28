class EasyFlvJs {
    constructor (o = {}) {
        const that = this;

        this.playVideoElement = document.querySelector('#' + o.playVideoElementId);
        this.playUrlInputElement = document.querySelector('#' + o.playUrlInputElementId);
        this.playButtonElement = document.querySelector('#' + o.playButtonElementId);
        
        this.PLAY_BUTTON_DISABLED_SECONDS = o.playButtonDisabledSeconds || 2;
        this.TASK_CYCLE_SECONDS = o.taskCycleSeconds || 5;
        this.MAX_RELOAD_DELAY_CYCLES = o.maxReloadDelayCycles || 2;
        this.MAX_BUFFERED_FRAME_SECONDS = o.maxBufferedFrameSeconds || 5;
        
        this.flvPlayer = undefined;
        this.task = undefined;
        this.lastDecodedFrames = 0;
        this.reloadDelayCycles = 0;

        this.playVideoElement.addEventListener('canplaythrough', function () {
            console.warn('canplaythrough event is triggered');
            window.setTimeout(function () { that.playVideoElement.play(); }, 500);
        });

        this.playButtonElement.addEventListener('click', function () {
            that.disableButtonTemporarily();

            if (!flvjs.isSupported()) {
                console.error('Sorry, flvjs does not support your device now');
                return;
            }

            that.play();
        });
    }
    
    disableButtonTemporarily() {
        const that = this;

        this.playButtonElement.disabled = true;
        window.setTimeout(function () {
            that.playButtonElement.disabled = false;
        }, this.PLAY_BUTTON_DISABLED_SECONDS * 1000);
    }

    init() {
        if (this.flvPlayer !== undefined) {
            this.flvPlayer.pause();
            this.flvPlayer.unload();
            this.flvPlayer.detachMediaElement();
            this.flvPlayer.destroy();
            this.flvPlayer = undefined;
        }
        if (this.task !== undefined) {
            window.clearInterval(this.task);
        }
        this.lastDecodedFrames = 0;
        this.reloadDelayCycles = 0;
    }

    play() {
        const that = this;

        const url = this.playUrlInputElement.value;
        if (url === '') {
            console.error('Please input url');
            return;
        }

        this.init();
        this.flvPlayer = flvjs.createPlayer({
            type: 'flv',
            isLive: true,
            cors: true,
            url: url
        }, {
            enableWorker: true
        });
        this.flvPlayer.attachMediaElement(this.playVideoElement);
        this.flvPlayer.load();
        this.flvPlayer.play().then(function () {
            that.task = window.setInterval(that.doTask, that.TASK_CYCLE_SECONDS * 1000, that);
        });
        this.flvPlayer.on(flvjs.Events.ERROR, function (param1, param2, param3) {
            console.error('ERROR: ' + param1 + ', ' + param2 + ', ' + JSON.stringify(param3));
        });
    }

    doTask(that) {
        const stat = that.flvPlayer.statisticsInfo;
        const droppedFrames = stat.droppedFrames;
        const decodedFrames = stat.decodedFrames;
        const speed = stat.speed === undefined ? 0.00 : stat.speed.toFixed(2);
        const buffered = (that.playVideoElement.buffered.end(0) - that.playVideoElement.currentTime).toFixed(2);
        const hasStoppedToDecodedFrames = decodedFrames === that.lastDecodedFrames;
        const isPlaying = !that.playVideoElement.paused;
        const isVisible = document.visibilityState === 'visible';
        
        if (hasStoppedToDecodedFrames && isPlaying && isVisible) {
            console.warn('Network is unstable for now, speed: ' + speed + 'KB/S');
            that.reloadDelayCycles++;
        } else {
            if (that.reloadDelayCycles > 0) { that.reloadDelayCycles--; }
        }
        
        console.log('Frames: ' + droppedFrames + '/' + decodedFrames + '(' + that.reloadDelayCycles + '), Speed: ' + speed + 'kB/s, Buffered: ' + buffered + 's');
        that.lastDecodedFrames = decodedFrames;
        
        if (that.reloadDelayCycles >= that.MAX_RELOAD_DELAY_CYCLES) {
            console.warn('Decoded Frames not keep growing for configured cycles, start to reload');
            that.play();
        } else if (buffered >= that.MAX_BUFFERED_FRAME_SECONDS) {
            console.warn('Buffered too much Frames Seconds, start to reload');
            that.play();
        }
    }
}