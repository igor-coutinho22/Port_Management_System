% ================================================================
%  IARTI Project 2025/2026
%  User Story 3.4.4 – Alternative Scheduling Algorithm (Heuristic)
%  ---------------------------------------------------------------
%  Goal:
%     Provide a faster scheduling algorithm for vessel loading/
%     unloading that yields a good (not necessarily optimal)
%     solution while reusing the same data model as the baseline.
% ================================================================



% ------------------------------------------------
% Example vessel facts (reuse or import from data)
% vessel(Name, Arrival, PlannedDeparture, UnloadTime, LoadTime)
% ------------------------------------------------
:- dynamic shortest_delay/2.
vessel(va, 6, 63, 10, 16).
vessel(vb, 23, 50, 9, 7).
vessel(vc, 8, 40, 5, 12).
vessel(vd, 27, 40, 0, 8).
vessel(ve, 36, 70, 12, 0).

% Uncomment more vessels for scalability tests
% vessel(vf, 40, 60, 8, 6).
% vessel(vg, 52, 80, 9, 10).

% ------------------------------------------------
% Helper predicates (same as baseline algorithm)
% ------------------------------------------------
sequence_temporization(LV, SeqTriplets) :-
    sequence_temporization1(0, LV, SeqTriplets).

sequence_temporization1(EndPrevSeq, [V|LV], [(V,TInUnload,TEndLoad)|SeqTriplets]) :-
    vessel(V, TIn, _, TUnload, TLoad),
    ( (TIn > EndPrevSeq, !, TInUnload is TIn)
    ; TInUnload is EndPrevSeq + 1 ),
    TEndLoad is TInUnload + TUnload + TLoad - 1,
    sequence_temporization1(TEndLoad, LV, SeqTriplets).
sequence_temporization1(_, [], []).

sum_delays([], 0).
sum_delays([(V,_,TEndLoad)|LV], S) :-
    vessel(V, _, TDep, _, _),
    TPossibleDep is TEndLoad + 1,
    ( (TPossibleDep > TDep, !, SV is TPossibleDep - TDep)
    ; SV is 0 ),
    sum_delays(LV, SLV),
    S is SV + SLV.

% ================================================================
%  Heuristic Scheduling Algorithm (Efficient Alternative)
%  ---------------------------------------------------------------
%  Strategy: Shortest Processing Time (SPT) – vessels requiring
%  the least total unload+load time are scheduled first.
%  Complexity: O(n log n)
% ================================================================

obtain_seq_heuristic(SeqTriplets, TotalDelay) :-
    get_time(Ti),
    findall((Dur,V),
        (vessel(V, _, _, U, L), Dur is U + L),
        Pairs),
    sort(1, @=<, Pairs, SortedPairs),
    pairs_values(SortedPairs, LV),
    sequence_temporization(LV, SeqTriplets),
    sum_delays(SeqTriplets, TotalDelay),
    get_time(Tf),
    Runtime is Tf - Ti,
    nl,
    write('--- Heuristic Schedule (SPT) ---'), nl,
    write('Sequence: '), write(LV), nl,
    write('Total Delay: '), write(TotalDelay), nl,
    format('Computation Time: ~3f seconds~n', [Runtime]),
    nl.

% ================================================================
%  Usage Example
%  ---------------------------------------------------------------
%  ?- obtain_seq_heuristic(Seq, Delay).
% ================================================================
