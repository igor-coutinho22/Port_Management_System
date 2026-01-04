% entry point
main_rebalance :-
    % 1. Collect vessels
    findall((A,V), vessel(V,A,_,_,_), LAV),
    sort(LAV, LAVSorted),
    % Helper to extract just the IDs from the sorted pairs
    extract_ids(LAVSorted, VesselsSorted),

    % 2. Collect docks (Arity 4)
    findall(D, dock(D, _, _, _), Docks),
    
    % 3. Greedy assignment
    assign_visits_greedy(VesselsSorted, Docks, [], Assignments),

    % 4. Total delay
    total_delay_for_assignment(Assignments, TotalDelay),

    % 5. Output
    write(Assignments), nl,
    write(TotalDelay), nl,
    halt.

extract_ids([], []).
extract_ids([(_-V)|Rest], [V|Ids]) :- extract_ids(Rest, Ids).

% --- Greedy assignment ---
assign_visits_greedy([], _Docks, Acc, Acc).
assign_visits_greedy([V|Vs], Docks, Acc, Assignments) :-
    find_best_dock_for_visit(V, Docks, Acc, BestDock),
    append(Acc, [assign(V, BestDock)], Acc1),
    assign_visits_greedy(Vs, Docks, Acc1, Assignments).

find_best_dock_for_visit(V, Docks, CurrAssign, Best) :-
    findall(D0-Delay0,
            ( member(D0, Docks), projected_delay_if_assigned(D0, V, CurrAssign, Delay0) ),
            Pairs),
    min_delay_pick(Pairs, CurrAssign, Best).

projected_delay_if_assigned(Dock, V, CurrAssign, TotalDelay) :-
    findall(Vx, (member(assign(Vx, Dock), CurrAssign)), AssignedV),
    append(AssignedV, [V], NewList),
    build_visit_sequence_by_arrival(NewList, Seq),
    % Use 3 cranes max instead of DockLength (which is 200+)
    MaxCr = 3, 
    multi_crane_temporization_max_cranes(Seq, MaxCr, _SeqQuad, TotalDelay, _TotalCraneMinutes).

min_delay_pick([D-Delay], _, D) :- !.
min_delay_pick([D1-Delay1, D2-Delay2 | Rest], CurrAssign, Best) :-
    ( Delay1 < Delay2 ->
        min_delay_pick([D1-Delay1 | Rest], CurrAssign, Best)
    ; Delay2 < Delay1 ->
        min_delay_pick([D2-Delay2 | Rest], CurrAssign, Best)
    ; count_assigned(D1, CurrAssign, C1),
      count_assigned(D2, CurrAssign, C2),
      ( C1 =< C2 ->
          min_delay_pick([D1-Delay1 | Rest], CurrAssign, Best)
      ;
          min_delay_pick([D2-Delay2 | Rest], CurrAssign, Best)
      )
    ).

count_assigned(Dock, Assignments, Count) :-
    findall(V, member(assign(V, Dock), Assignments), L),
    length(L, Count).

build_visit_sequence_by_arrival(VisitIds, SeqV) :-
    findall((A,V),( member(V,VisitIds), vessel(V,A,_,_,_) ), Pairs),
    sort(Pairs, SortedPairs),
    extract_ids(SortedPairs, SeqV).

total_delay_for_assignment(Assignments, TotalDelay) :-
    findall(Dock, dock(Dock, _, _, _), Docks),
    total_delay_for_docks(Docks, Assignments, 0, TotalDelay).

total_delay_for_docks([], _Assign, Acc, Acc).
total_delay_for_docks([D|Ds], Assign, Acc, Total) :-
    findall(V, member(assign(V, D), Assign), Vlist),
    build_visit_sequence_by_arrival(Vlist, Seq),
    MaxCr = 3,
    ( Seq = [] -> DelayD = 0 ; multi_crane_temporization_max_cranes(Seq, MaxCr, _Q, DelayD, _CM) ),
    Acc1 is Acc + DelayD,
    total_delay_for_docks(Ds, Assign, Acc1, Total).

multi_crane_temporization_max_cranes(LV, MaxCr, SeqQuad, TotalDelay, TotalCraneMinutes) :-
    multi_crane_temporization_max_cranes1(0, LV, MaxCr, SeqQuad, TotalDelay, TotalCraneMinutes).

multi_crane_temporization_max_cranes1(_, [], [], 0, 0).
multi_crane_temporization_max_cranes1(EndPrev, [V|LV], MaxCr,
                                      [(V,TStart,TEnd,ChosenK)|SeqRest],
                                      TotalDelay, TotalCraneMinutes) :-
    vessel(V, TIn, TDep, TUnload, TLoad),
    P is TUnload + TLoad,
    ( TIn > EndPrev -> S is TIn ; S is EndPrev + 1 ),
    generate_crane_options(1, MaxCr, P, S, TDep, Options),
    pick_best_option(Options, opt(ChosenK, EChosen, DelayChosen, CraneMinutesChosen)),
    TStart = S,
    TEnd is EChosen,
    _Duration is TEnd - TStart + 1,
    multi_crane_temporization_max_cranes1(TEnd, LV, MaxCr, SeqRest, DelayRest, CraneMinutesRest),
    TotalDelay is DelayChosen + DelayRest,
    TotalCraneMinutes is CraneMinutesChosen + CraneMinutesRest.

generate_crane_options(K, MaxK, _P, _S, _TDep, []) :- K > MaxK, !.
generate_crane_options(K, MaxK, P, S, TDep, [opt(K,E,Delay,CM)|Rest]) :-
    P2 is (P + K - 1) // K,
    E is S + P2 - 1,
    TPossibleDep is E + 1,
    ( TPossibleDep > TDep -> Delay is TPossibleDep - TDep ; Delay is 0 ),
    Duration is E - S + 1,
    CM is K * Duration,
    K1 is K + 1,
    generate_crane_options(K1, MaxK, P, S, TDep, Rest).

pick_best_option([O], O) :- !.
pick_best_option([opt(K1,E1,D1,CM1), opt(K2,E2,D2,CM2) | Rest], Best) :-
    ( D1 < D2 -> pick_best_option([opt(K1,E1,D1,CM1) | Rest], Best)
    ; D2 < D1 -> pick_best_option([opt(K2,E2,D2,CM2) | Rest], Best)
    ; ( K1 =< K2 -> pick_best_option([opt(K1,E1,D1,CM1) | Rest], Best)
      ; pick_best_option([opt(K2,E2,D2,CM2) | Rest], Best)
      )
    ).