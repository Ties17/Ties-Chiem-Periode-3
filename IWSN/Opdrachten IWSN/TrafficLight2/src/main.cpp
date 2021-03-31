#include <Arduino.h>

#include <fsm.h>

#define RED1 D1
#define YELLOW1 D2
#define GREEN1 D3
#define BUTTON1 D0

#define RED2 D6
#define YELLOW2 D7
#define GREEN2 D8
#define BUTTON2 D5

int tr1LightsAndButton[] = {RED1, YELLOW1, GREEN1, BUTTON1}; //Order -> red, yellow, green, button
int tr2LightsAndButton[] = {RED2, YELLOW2, GREEN2, BUTTON2};

ENUM_STATE trState1 = STATE_RED;
ENUM_STATE trState2 = STATE_GREEN;

ENUM_EVENT trEvent1 = EVENT_STATE_EXECUTED;
ENUM_EVENT trEvent2 = EVENT_STATE_EXECUTED;

unsigned int timer1;
unsigned int timer2;

bool buttonPressed;
unsigned long loopTiming;
unsigned long loopDuration;

STATE_METHODS_STRUCT fsm_state_methods[STATE_NUM] = {
    {start_pre, start_loop, start_post},
    {red_pre, red_loop, red_post},
    {orange_pre, orange_loop, orange_post},
    {green_pre, green_loop, green_post},
    {outoforder_pre, outoforder_loop, outoforder_post}
};
// Define your transition table here. States given in the collomn and events in de row.
//
// -------------------------------------------------------------------------------------------------------------------
//      EVENTS| BUTTON          | GREEN           | TIMER           | OUTOFORDER     | RED            | STATE_EXECUTED|
// -------------------------------------------------------------------------------------------------------------------
// START      | -               | -               | -               | -              | -              | RED     
// RED        | GREEN           | -               | GREEN           | OUTOFORDER     | -              | -
// ORANGE     | GREEN           | -               | RED             | OUTOFORDER     | -              | -
// GREEN      | -               | -               | ORANGE          | OUTOFORDER     | -              | -            
// OUTOFORDER | -               | -               | -               | -              | RED            |               
// -------------------------------------------------------------------------------------------------------------------
STATE_TRANSITION_STRUCT fsm_state_transition[STATE_NUM][EVENT_NUM] = {
{ // STATE_START
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_RED}
  },
  { // STATE_RED
    {STATE_GREEN},
    {STATE_INVALID_TRANSITION},
    {STATE_GREEN},
    {STATE_OUTOFORDER},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION}
  }, 
  { // STATE_ORANGE
    {STATE_GREEN},
    {STATE_INVALID_TRANSITION},
    {STATE_RED},
    {STATE_OUTOFORDER},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION}
  },
  { // STATE_GREEN
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_ORANGE},
    {STATE_OUTOFORDER},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION}
  },
  { // STATE_OUTOFORDER
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_INVALID_TRANSITION},
    {STATE_RED},
    {STATE_INVALID_TRANSITION},
  }
};

String getEventName (ENUM_EVENT event) {
    switch (event) {
    case EVENT_BUTTON:
      return "EVENT_BUTTON";
    case EVENT_OUTOFORDER:
        return "EVENT_OUTOFORDER";
    case EVENT_GREEN:
        return "EVENT_GREEN";
    case EVENT_RED:
        return "EVENT_RED";
    case EVENT_TIMER:
        return "EVENT_TIMER";
    case EVENT_STATE_EXECUTED:
        return "EVENT_STATE_EXECUTED";
    default:
        return "UNKNOWN";
    }
}

void FSMRaiseEvent (ENUM_EVENT new_event, ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int lightAndButton[]) {
    ENUM_STATE new_state = fsm_state_transition[*state][new_event].nextState;
    if ( new_state != STATE_INVALID_TRANSITION ) {

        // call event.post
        if( fsm_state_methods[*state].post != NULL) {
            fsm_state_methods[*state].post(event, state, timer, lightAndButton) ;
        } 
        
        // call newstate ev.pre
        if( fsm_state_methods[new_state].pre != NULL) {
            fsm_state_methods[new_state].pre(event, state, timer, lightAndButton);
        } 
        
        *state = new_state;
        *event = new_event;

        Serial.println("State change: " + getEventName(*event) );
    }
}

void FSMInit (ENUM_EVENT event, ENUM_STATE state, unsigned int *timer, int lightAndButton[]) {
  Serial.println("FSM Init");
  if( fsm_state_methods[state].pre != NULL) {
    fsm_state_methods[state].pre(&event, &state, timer, lightAndButton);
  } 
}

void FSMLoop (ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int lightAndButton[]) {
  if( fsm_state_methods[*state].loop != NULL) {
    fsm_state_methods[*state].loop(event, state, timer, lightAndButton);
  }

  FSMRaiseEvent(EVENT_STATE_EXECUTED, event, state, timer, lightAndButton);
  Serial.println(*state);
}

void setup() {
  pinMode(RED1, OUTPUT); // RED
  pinMode(YELLOW1, OUTPUT); // YELLOW
  pinMode(GREEN1, OUTPUT); // GREEN
  pinMode(BUTTON1, INPUT_PULLUP); // Button

  pinMode(RED2, OUTPUT); // RED
  pinMode(YELLOW2, OUTPUT); // YELLOW
  pinMode(GREEN2, OUTPUT); // GREEN
  pinMode(BUTTON2, INPUT_PULLUP); // Button

  // Switch off the leds
  digitalWrite(RED1, LOW);
  digitalWrite(YELLOW1, LOW);
  digitalWrite(GREEN1, LOW);

  digitalWrite(RED2, LOW);
  digitalWrite(YELLOW2, LOW);
  digitalWrite(GREEN2, LOW);

  // Initialize the serial communication
  Serial.begin(9600);
  buttonPressed = false;
}


void loop() {
  loopTiming = millis();

  FSMLoop(&trEvent1, &trState1, &timer1, tr1LightsAndButton);
  FSMLoop(&trEvent2, &trState2, &timer2, tr2LightsAndButton);

  loopDuration = millis() - loopTiming;
  String ld = "loop duration: " + String(loopDuration);

  //Serial.println(ld);

  if ( loopDuration < 100 ) { // Make sure the loop is around 100 ms always!
    delay(100 - loopDuration);
  }
}

void start_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("start_pre");
}

void start_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("start_loop");
}

void start_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("start_post");
}

void red_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  *timer = millis();
  Serial.println("red_pre");
  digitalWrite(trLightsAndButton[0], HIGH);
}

void red_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  if (buttonPressed == 0 && digitalRead(trLightsAndButton[3]) == HIGH ) {
    buttonPressed = true;
    FSMRaiseEvent(EVENT_BUTTON, event, state, timer, trLightsAndButton);
  }

  if( (millis() - *timer) > 7000 ) { //Wait 7 sec
      FSMRaiseEvent(EVENT_TIMER, event, state, timer, trLightsAndButton);
  }

  Serial.println("red loop");
}

void red_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
    Serial.println("red_post");
    buttonPressed = false;
    digitalWrite(trLightsAndButton[0], LOW);
}

void orange_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  *timer = millis();
  Serial.println("yellow_pre");
  digitalWrite(trLightsAndButton[1], HIGH); //trLightsAndButton[1] == yellow
}

void orange_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  if( (millis() - *timer) > 2000 ) { //Wait 2 sec
      FSMRaiseEvent(EVENT_TIMER, event, state, timer, trLightsAndButton);
  }
  Serial.println("yellow_loop");
}

void orange_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("yellow_post");
  digitalWrite(trLightsAndButton[1], LOW); //trLightsAndButton[1] == yellow
}

void green_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  *timer = millis();
  Serial.println("green_pre");
  digitalWrite(trLightsAndButton[2], HIGH);
}

void green_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  if( (millis() - *timer) > 5000 ) { //Wait 5 sec
      FSMRaiseEvent(EVENT_TIMER, event, state, timer, trLightsAndButton);
  }
  Serial.println("green loop");
}

void green_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("green_post");
  digitalWrite(trLightsAndButton[2], LOW);
}

void outoforder_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("outoforder_pre");
}

void outoforder_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("outoforder_pre");
}

void outoforder_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]) {
  Serial.println("outoforder_post");
}