
% Scheduling Vessels Unload/Load

:-dynamic shortest_delay/2.

sequence_temporization(LV,SeqTriplets):-
		sequence_temporization1(0,LV,SeqTriplets).


sequence_temporization1(EndPrevSeq,[V|LV],[(V,TInUnload,TEndLoad)|SeqTriplets]):-
			vessel(V,TIn,_,TUnload,TLoad),
			 ( (TIn> EndPrevSeq,!, TInUnload is TIn); TInUnload is EndPrevSeq+1),
		TEndLoad is TInUnload + TUnload+TLoad -1,
		sequence_temporization1(TEndLoad,LV,SeqTriplets).

sequence_temporization1(_,[],[]).


sum_delays([],0).

sum_delays([(V,_,TEndLoad)|LV],S):-
		vessel(V,_,TDep,_,_),TPossibleDep is TEndLoad+1,
		( (TPossibleDep>TDep,!,SV is TPossibleDep-TDep);SV is 0),
		sum_delays(LV,SLV),
		S is SV+SLV.


obtain_seq_shortest_delay(SeqBetterTriplets, SShortestDelay):-
    (obtain_seq_shortest_delay1;true),
    retract(shortest_delay(SeqBetterTriplets, SShortestDelay)).


obtain_seq_shortest_delay1:-
    asserta(shortest_delay(_,100000)),
    findall(V,vessel(V,_,_,_,_),LV),!,
    permutation(LV,SeqV),
    sequence_temporization(SeqV,SeqTriplets),
    sum_delays(SeqTriplets,S),
    compare_shortest_delay(SeqTriplets,S),
    fail.

compare_shortest_delay(SeqTriplets,S):-
 shortest_delay(_,SLower),
    ((S<SLower,!,retract(shortest_delay(_,_)),asserta(shortest_delay(SeqTriplets,S)));true).





% ARRIVAL TIME

heuristic_early_arrival_time(SeqTripletsH,SDelaysH):-
findall((Arrival,V),vessel(V,Arrival,_,_,_),LAV),
sort(LAV,LAVSorted),
obtain_vessels(LAVSorted,SeqV),
sequence_temporization(SeqV,SeqTripletsH),
sum_delays(SeqTripletsH,SDelaysH),!.


% EXTRACT VESSELS FROM FINDALL LIST

obtain_vessels([],[]).
obtain_vessels([(_,V)|LAV],[V|LV]):-obtain_vessels(LAV,LV).
obtain_vessels([(_,_,V)|LAV],[V|LV]):-obtain_vessels(LAV,LV).


% DEPARTURE TIME

heuristic_early_departure_time(SeqTripletsH,SDelaysH):-
findall((Departure,V),vessel(V,_,Departure,_,_),LDV),
sort(LDV,LDVSorted),
obtain_vessels(LDVSorted,SeqV),
sequence_temporization(SeqV,SeqTripletsH),
sum_delays(SeqTripletsH,SDelaysH),!.


% SHORTEST PROCESSING TIME

heuristic_shortest_processing_time(SeqTripletsH,SDelaysH):-
findall((ProcTime,V),(vessel(V,_,_,Loading,Unloading),ProcTime is Loading+Unloading),LDV),
sort(LDV,LDVSorted),
obtain_vessels(LDVSorted,SeqV),
sequence_temporization(SeqV,SeqTripletsH),
sum_delays(SeqTripletsH,SDelaysH),!.

% MINIMUM SLCAK TIME

heuristic_minimum_slack_time(SeqTripletsH,SDelaysH):-
findall((Slack,V),(vessel(V,Arrival,Departure,Loading,Unloading),TotalTime is Departure-Arrival,ProcTime is Loading+Unloading,Slack is TotalTime-ProcTime),LDV),
sort(LDV,LDVSorted),
obtain_vessels(LDVSorted,SeqV),
sequence_temporization(SeqV,SeqTripletsH),
sum_delays(SeqTripletsH,SDelaysH),!.


% ////////////////////////////////////////////////////////////////////////
% ////////////////////////////////////////////////////////////////////////
% OUR HEURISTICS
% ////////////////////////////////////////////////////////////////////////
% ////////////////////////////////////////////////////////////////////////
% ////////////////////////////////////////////////////////////////////////


% ORDERS THE VESSELS THAT ALREADY ARRIVED AT THE TIME THE DOCK IS FREE AND SORTS BASED ON DEPARTURE TIME

heuristic_arrived_shortest_departure_time(SeqTripletsH,SDelaysH):-
findall((Departure,Arrival,V),vessel(V,Arrival,Departure,_,_),LDV),
sort(LDV,LDVSorted),
orderArrived(LDVSorted,0,R),
obtain_vessels(R,SeqV),
sequence_temporization(SeqV,SeqTripletsH),
sum_delays(SeqTripletsH,SDelaysH),!.

% Base case: no more vessels to schedule
orderArrived([], _CurrentTime, []).

orderArrived(LDVSorted, CurrentTime, [(Departure, Arrival, V) | R]) :-
    % Try to select the earliest-departure vessel that has already arrived
    select_earliest_arrived(LDVSorted, CurrentTime, (Departure, Arrival, V), Rest),
    !,
    % Look up processing time (loading + unloading)
    vessel(V, Arrival, Departure, LoadTime, UnloadTime),
    ProcTime is LoadTime + UnloadTime,

    % Boat can only start after it arrives and dock is free
    Start is max(CurrentTime, Arrival),
    Finish is Start + ProcTime,

    % Recurse with updated time and remaining vessels
    orderArrived(Rest, Finish, R).

% If no vessel has Arrival <= CurrentTime, we have to wait
orderArrived(LDVSorted, CurrentTime, R) :-
    % No eligible arrived vessel → advance time to earliest arrival
    earliest_arrival(LDVSorted, NextTime),
    NextTime > CurrentTime,
    orderArrived(LDVSorted, NextTime, R).



% --- helper: select first vessel whose Arrival <= CurrentTime ---
% Because LDVSorted is sorted by Departure, this is the earliest-departureamong the already arrived.

select_earliest_arrived([(Departure, Arrival, V) | Rest], CurrentTime,
                        (Departure, Arrival, V), Rest) :-
    Arrival =< CurrentTime,
    !.

select_earliest_arrived([X | XS], CurrentTime, Chosen, [X | Rest]) :-
    select_earliest_arrived(XS, CurrentTime, Chosen, Rest).



% --- helper: earliest_arrival/2: minimum Arrival in list of (D,A,V) ---

earliest_arrival([( _D, A, _V ) | Rest], MinA) :-
    earliest_arrival(Rest, A, MinA).

earliest_arrival([], Acc, Acc).

earliest_arrival([(_D, A, _V) | Rest], Acc, MinA) :-
    ( A < Acc -> NewAcc = A ; NewAcc = Acc ),
    earliest_arrival(Rest, NewAcc, MinA).










% MAIN HEURISTIC: ATC (Apparent Tardiness Cost)


heuristic_atc(SeqTripletsH, SDelaysH) :-
    % 1. Build internal job list with processing time
    findall(v(V, A, D, P),
            vessel_proc(V, A, D, P),
            Jobs),
    % 2. Build an order of vessels using ATC rule
    atc_schedule(Jobs, 0, SeqV),
    % 3. Use your existing temporization & delay functions
    sequence_temporization(SeqV, SeqTripletsH),
    sum_delays(SeqTripletsH, SDelaysH),
    !.

% Helper: compute processing time (loading + unloading)
vessel_proc(V, A, D, P) :-
    vessel(V, A, D, Load, Unload),
    P is Load + Unload.
% --- ATC SCHEDULER ---
% atc_schedule(+UnscheduledJobs, +CurrentTime, -OrderedVessels)

% No jobs left
atc_schedule([], _T, []).

atc_schedule(Jobs, T, [V | RestOrder]) :-
    % Jobs that have already arrived by time T
    findall(J,
            ( member(J, Jobs),
              J = v(_V, A, _D, _P),
              A =< T ),
            Arrived),
    Arrived \= [],
    !,
    % Average processing time of all remaining jobs
    avg_p(Jobs, Pbar),
    K is 3.0,               % tuning parameter, try 2.0–4.0 if you want

    % Choose job with best (max) ATC priority index
    best_atc_job(Arrived, T, Pbar, K, v(V, A, D, P)),

    % Remove chosen job from Jobs
    select(v(V, A, D, P), Jobs, JobsRest),

    % Compute when it would actually finish
    Start is max(T, A),
    Finish is Start + P,

    % Continue from Finish
    atc_schedule(JobsRest, Finish, RestOrder).

% If no job has arrived yet at time T, jump to earliest arrival
atc_schedule(Jobs, T, Order) :-
    min_arrival(Jobs, NextT),
    NextT > T,
    atc_schedule(Jobs, NextT, Order).
% --- ATC PRIORITY ---

% best_atc_job(+ArrivedJobs, +T, +Pbar, +K, -BestJob)

best_atc_job([J | Js], T, Pbar, K, BestJob) :-
    atc_priority(J, T, Pbar, K, PI),
    best_atc_job(Js, T, Pbar, K, J, PI, BestJob).

best_atc_job([], _T, _Pbar, _K, Best, _BestPI, Best).

best_atc_job([J | Js], T, Pbar, K, CurBest, CurPI, Best) :-
    atc_priority(J, T, Pbar, K, PI),
    ( PI > CurPI ->
        NewBest = J,
        NewPI   = PI
    ;
        NewBest = CurBest,
        NewPI   = CurPI
    ),
    best_atc_job(Js, T, Pbar, K, NewBest, NewPI, Best).

% atc_priority(+Job, +T, +Pbar, +K, -PI)

atc_priority(v(_V, _A, D, P), T, Pbar, K, PI) :-
    Slack is D - P - T,
    ( Slack > 0 ->
        SlackPos = Slack
    ;   SlackPos = 0
    ),
    Den is K * Pbar,
    ( Den =:= 0.0 ->
        ExpTerm = 1.0
    ;
        ExpTerm is exp(-(SlackPos / Den))
    ),
    PI is (1.0 / P) * ExpTerm.


% --- Average processing time of remaining jobs ---

avg_p(Jobs, Pbar) :-
    sum_p_and_count(Jobs, SumP, Count),
    ( Count =:= 0 ->
        Pbar = 0.0
    ;
        Pbar is SumP / Count
    ).

sum_p_and_count([], 0.0, 0).
sum_p_and_count([v(_V, _A, _D, P) | Rest], SumP, Count) :-
    sum_p_and_count(Rest, SumRest, CountRest),
    SumP is SumRest + P,
    Count is CountRest + 1.

% --- Earliest arrival time among Jobs ---

min_arrival([v(_V, A, _D, _P) | Rest], MinA) :-
    min_arrival(Rest, A, MinA).

min_arrival([], Acc, Acc).
min_arrival([v(_V, A, _D, _P) | Rest], Acc, MinA) :-
    ( A < Acc -> NewAcc = A ; NewAcc = Acc ),
    min_arrival(Rest, NewAcc, MinA).



% Map heuristic names to predicates
call_heuristic(minimum_slack_time, SeqTripletsH, SDelaysH) :-
    heuristic_minimum_slack_time(SeqTripletsH, SDelaysH).

call_heuristic(early_departure_time, SeqTripletsH, SDelaysH) :-
    heuristic_early_departure_time(SeqTripletsH, SDelaysH).

call_heuristic(arrived_shortest_departure_time, SeqTripletsH, SDelaysH) :-
    heuristic_arrived_shortest_departure_time(SeqTripletsH, SDelaysH).

call_heuristic(atc, SeqTripletsH, SDelaysH) :-
    heuristic_atc(SeqTripletsH, SDelaysH).

call_heuristic(optimal, SeqTripletsH, SDelaysH) :-
    obtain_seq_shortest_delay(SeqTripletsH, SDelaysH).


% [(vd,27,34),(vf,40,53),...]
% 520
run_heuristic(HeuristicName) :-
    call_heuristic(HeuristicName, SeqTripletsH, SDelaysH),
    write(SeqTripletsH), nl,
    write(SDelaysH), nl.

