#pragma once

typedef enum {
    STATE_START,
    STATE_RED,
    STATE_ORANGE,
    STATE_GREEN,
    STATE_OUTOFORDER,
    STATE_INVALID_TRANSITION
} ENUM_STATE;

typedef enum {
    EVENT_GREEN,
    EVENT_BUTTON,
    EVENT_TIMER,
    EVENT_OUTOFORDER,
    EVENT_RED,
    EVENT_STATE_EXECUTED
} ENUM_EVENT;

typedef struct {
    void (*pre)(void);
    void (*loop)(void);
    void (*post)(void);
} STATE_METHODS_STRUCT;

typedef struct {
    ENUM_STATE nextState;
} STATE_TRANSITION_STRUCT;

void FSMInit();
void FSMLoop();
void FSMRaiseEvent(ENUM_EVENT new_event);

void start_pre();
void start_loop();
void start_post();