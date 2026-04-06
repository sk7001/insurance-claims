import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any;
  private isRecording = false;
  private transcript$ = new Subject<string>();

  constructor(private ngZone: NgZone) {
    const { webkitSpeechRecognition }: any = window;
    if (webkitSpeechRecognition) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.ngZone.run(() => {
            this.transcript$.next(finalTranscript);
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.stop();
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }
  }

  getTranscript(): Observable<string> {
    return this.transcript$.asObservable();
  }

  start(): void {
    if (this.recognition && !this.isRecording) {
      try {
        this.recognition.start();
        this.isRecording = true;
      } catch (e) {
        console.error('Speech recognition start error:', e);
      }
    }
  }

  stop(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }
}
