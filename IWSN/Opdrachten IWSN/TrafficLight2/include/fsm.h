#pragma once

typedef enum {
    STATE_START,
    STATE_RED,
    STATE_ORANGE,
    STATE_GREEN,
    STATE_OUTOFORDER,
    STATE_INVALID_TRANSITION,
    STATE_NUM
} ENUM_STATE;

typedef enum {
    EVENT_BUTTON,
    EVENT_GREEN,
    EVENT_TIMER,
    EVENT_OUTOFORDER,
    EVENT_RED,
    EVENT_STATE_EXECUTED,
    EVENT_NUM
} ENUM_EVENT;

typedef struct {
    void (*pre)(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
    void (*loop)(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer,int trLightsAndButton[]);
    void (*post)(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
} STATE_METHODS_STRUCT;

typedef struct {
    ENUM_STATE nextState;
} STATE_TRANSITION_STRUCT;

void FSMInit (ENUM_EVENT event, ENUM_STATE state, unsigned int *timer, int trLightsAndButton[]);
void FSMLoop (ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void FSMRaiseEvent (ENUM_EVENT new_event, ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int lightAndButton[]);

// Forward declaration of the transition methods.
void start_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void start_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void start_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);

void red_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void red_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void red_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);

void orange_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void orange_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void orange_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);

void green_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void green_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void green_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);

void outoforder_pre(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void outoforder_loop(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);
void outoforder_post(ENUM_EVENT *event, ENUM_STATE *state, unsigned int *timer, int trLightsAndButton[]);

