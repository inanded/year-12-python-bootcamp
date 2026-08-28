import type { Badge } from "./course-data";

const code = String.raw;

export const CAPSTONE_BADGE: Badge = {
  id: "problem-solver",
  number: "10",
  title: "Python Problem Solver",
  short: "Build one complete GCSE-level tournament results system in three clear stages.",
  credential: "Pseudocode-to-Python Ready",
  prerequisite: "Attempt after Badges 01–09",
  learning: [
    "Translate valid Cambridge pseudocode into Python",
    "Use 1D and 2D lists, selection, iteration and validation",
    "Use functions, procedures, files, linear search and bubble sort",
    "Test a complete GCSE-level solution systematically",
  ],
  rules: [
    "This is one program. Complete Bronze, then add Silver, then add Gold.",
    "Run and test each function before connecting it to the main program.",
    "The pseudocode arrays use positions starting at 1; Python list positions start at 0.",
    "In the pseudocode example below, Scores is the shared 2D array loaded by the main program.",
  ],
  pseudoExample: code`FUNCTION CalculateTotal(Competitor : INTEGER) RETURNS INTEGER
    DECLARE Event : INTEGER
    DECLARE Total : INTEGER

    Total ← 0
    FOR Event ← 1 TO 4
        Total ← Total + Scores[Competitor, Event]
    NEXT Event
    RETURN Total
ENDFUNCTION`,
  pythonExample: code`def calculate_total(competitor, scores):
    total = 0
    for event in range(0, 4):
        total = total + scores[competitor][event]
    return total`,
  levels: [
    {
      id: "bronze",
      label: "Bronze · Load and analyse",
      support: "Use the complete Cambridge pseudocode and Python function headings supplied.",
      scenario: "School tournament results — Stage 1",
      outcome: "Load five competitors and four event scores, then display each total and average.",
      pseudocode: code`// Shared data used by the subroutine and main program
CONSTANT CompetitorCount = 5
CONSTANT EventCount = 4
DECLARE Names : ARRAY[1:5] OF STRING
DECLARE Scores : ARRAY[1:5, 1:4] OF INTEGER

FUNCTION CalculateTotal(Competitor : INTEGER) RETURNS INTEGER
    DECLARE Event : INTEGER
    DECLARE Total : INTEGER
    Total ← 0
    FOR Event ← 1 TO EventCount
        Total ← Total + Scores[Competitor, Event]
    NEXT Event
    RETURN Total
ENDFUNCTION

// Main program
OPENFILE "names.txt" FOR READ
OPENFILE "tournament_scores.txt" FOR READ
FOR Competitor ← 1 TO CompetitorCount
    READFILE "names.txt", Names[Competitor]
    FOR Event ← 1 TO EventCount
        READFILE "tournament_scores.txt", Scores[Competitor, Event]
    NEXT Event
NEXT Competitor
CLOSEFILE "names.txt"
CLOSEFILE "tournament_scores.txt"

FOR Competitor ← 1 TO CompetitorCount
    Total ← CalculateTotal(Competitor)
    Average ← Total / EventCount
    OUTPUT Names[Competitor], Total, Average
NEXT Competitor`,
      pythonStarter: code`def load_names(filename):
    names = []
    # Read one stripped name from each line, then return names.

def load_scores(filename, competitor_count, event_count):
    scores = []
    # Build and return a 2D list: one row per competitor.

def calculate_total(competitor, scores):
    # Add every score in one competitor's row and return the total.

names = load_names("names.txt")
scores = load_scores("tournament_scores.txt", 5, 4)

# Loop through the competitors and display name, total and average.`,
      tasks: [
        {
          title: "1. Load the two files",
          instruction: "Download names.txt and tournament_scores.txt. Complete load_names(). Complete load_scores() so it returns a 5-row by 4-column 2D list of integers.",
        },
        {
          title: "2. Calculate one competitor’s result",
          instruction: "Complete calculate_total(). It must use a loop to add the four values in scores[competitor] and return the total.",
        },
        {
          title: "3. Display the summary",
          instruction: "For all five competitors, display the name, total and average. Use labels so another person can understand the output.",
        },
      ],
      tests: [
        "The files produce five names and a 5 × 4 scores list.",
        "Ana’s scores 12, 15, 18, 14 produce total 59 and average 14.75.",
        "Elena’s scores 19, 17, 20, 18 produce total 74 and average 18.5.",
      ],
      hints: [
        "Use line.strip() for names and int(line.strip()) for scores.",
        "Inside load_scores(), create a new row list for each competitor, append four scores to it, then append the row to scores.",
        "Python uses scores[competitor][event], not Scores[Competitor, Event].",
      ],
      model: code`def load_names(filename):
    names = []
    with open(filename, "r", encoding="utf-8") as file:
        for line in file:
            names.append(line.strip())
    return names

def load_scores(filename, competitor_count, event_count):
    scores = []
    with open(filename, "r", encoding="utf-8") as file:
        for competitor in range(0, competitor_count):
            row = []
            for event in range(0, event_count):
                score = int(file.readline().strip())
                row.append(score)
            scores.append(row)
    return scores

def calculate_total(competitor, scores):
    total = 0
    for event in range(0, len(scores[competitor])):
        total = total + scores[competitor][event]
    return total

names = load_names("names.txt")
scores = load_scores("tournament_scores.txt", 5, 4)

for competitor in range(0, len(names)):
    total = calculate_total(competitor, scores)
    average = total / len(scores[competitor])
    print(names[competitor], "Total:", total, "Average:", average)`,
      modelNotes: [
        "The nested loop creates one inner list for each competitor.",
        "The calculation function receives the data it needs and returns one value; it does not ask for input or print.",
      ],
    },
    {
      id: "silver",
      label: "Silver · Search, validate and update",
      support: "Keep your Bronze program. Add the supplied search and update design.",
      scenario: "School tournament results — Stage 2",
      outcome: "Find a competitor, validate a corrected score, update the 2D list and save it.",
      pseudocode: code`FUNCTION LinearSearch(Target : STRING) RETURNS INTEGER
    DECLARE Position : INTEGER
    Position ← 1
    WHILE Position <= CompetitorCount
        IF Names[Position] = Target THEN
            RETURN Position
        ENDIF
        Position ← Position + 1
    ENDWHILE
    RETURN 0
ENDFUNCTION

INPUT TargetName
Position ← LinearSearch(TargetName)

IF Position = 0 THEN
    OUTPUT "Competitor not found"
ELSE
    REPEAT
        INPUT EventNumber
    UNTIL EventNumber >= 1 AND EventNumber <= 4

    REPEAT
        INPUT NewScore
    UNTIL NewScore >= 0 AND NewScore <= 20

    Scores[Position, EventNumber] ← NewScore

    OPENFILE "updated_scores.txt" FOR WRITE
    FOR Competitor ← 1 TO CompetitorCount
        FOR Event ← 1 TO EventCount
            WRITEFILE "updated_scores.txt", Scores[Competitor, Event]
        NEXT Event
    NEXT Competitor
    CLOSEFILE "updated_scores.txt"
    OUTPUT "Score updated"
ENDIF`,
      pythonStarter: code`# Keep the functions and main program from Bronze.

def linear_search(names, target):
    # Return the matching Python position, or -1 if it is not found.

def save_scores(filename, scores):
    # Write every integer to its own line.

target_name = input("Competitor name: ")
position = linear_search(names, target_name)

# If found: validate event 1–4 and score 0–20.
# Update scores[position][event_number - 1], then save the data.`,
      tasks: [
        {
          title: "1. Add linear search",
          instruction: "Search names for the entered competitor. Return its Python list position, or -1 if no match exists. Display Competitor not found when the result is -1.",
        },
        {
          title: "2. Validate and update",
          instruction: "If found, repeatedly ask until the event number is 1–4 and the new integer score is 0–20. Update the correct cell in the 2D list.",
        },
        {
          title: "3. Save and prove the change",
          instruction: "Write all 20 scores to updated_scores.txt. Display the competitor’s recalculated total so the user can see that the change worked.",
        },
      ],
      tests: [
        "Searching for Sofia returns Python position 2; searching for Noor returns -1 and changes nothing.",
        "Event numbers 0 and 5 are rejected; 1 and 4 are accepted.",
        "Scores -1 and 21 are rejected; 0 and 20 are accepted and exactly 20 lines are saved.",
      ],
      hints: [
        "Compare names[position].lower() with target.lower() if you want the search to ignore capital letters.",
        "The user enters events 1–4, but Python columns are 0–3: subtract 1 only when accessing the list.",
        "Use nested for loops in save_scores() so every cell is written on a separate line.",
      ],
      model: code`def linear_search(names, target):
    for position in range(0, len(names)):
        if names[position].lower() == target.lower():
            return position
    return -1

def save_scores(filename, scores):
    with open(filename, "w", encoding="utf-8") as file:
        for competitor in range(0, len(scores)):
            for event in range(0, len(scores[competitor])):
                file.write(str(scores[competitor][event]) + "\n")

target_name = input("Competitor name: ")
position = linear_search(names, target_name)

if position == -1:
    print("Competitor not found")
else:
    event_number = int(input("Event number (1 to 4): "))
    while event_number < 1 or event_number > 4:
        event_number = int(input("Enter 1, 2, 3 or 4: "))

    new_score = int(input("New score (0 to 20): "))
    while new_score < 0 or new_score > 20:
        new_score = int(input("Enter a score from 0 to 20: "))

    scores[position][event_number - 1] = new_score
    save_scores("updated_scores.txt", scores)
    new_total = calculate_total(position, scores)
    print("Score updated. New total:", new_total)`,
      modelNotes: [
        "The search returns the position needed to update the matching row.",
        "The event number is kept in a user-friendly 1–4 form and converted only at the point of list access.",
      ],
    },
    {
      id: "gold",
      label: "Gold · Rank and report",
      support: "Keep Bronze and Silver. Complete the final stage, then submit one finished program.",
      scenario: "School tournament results — Final stage",
      outcome: "Calculate totals, sort a leaderboard and write a permanent report.",
      pseudocode: code`DECLARE Totals : ARRAY[1:5] OF INTEGER

FOR Competitor ← 1 TO CompetitorCount
    Totals[Competitor] ← CalculateTotal(Competitor)
NEXT Competitor

FOR Pass ← 1 TO CompetitorCount - 1
    FOR Position ← 1 TO CompetitorCount - Pass
        IF Totals[Position] < Totals[Position + 1] THEN
            TempTotal ← Totals[Position]
            Totals[Position] ← Totals[Position + 1]
            Totals[Position + 1] ← TempTotal

            TempName ← Names[Position]
            Names[Position] ← Names[Position + 1]
            Names[Position + 1] ← TempName
        ENDIF
    NEXT Position
NEXT Pass

OPENFILE "leaderboard.txt" FOR WRITE
FOR Position ← 1 TO CompetitorCount
    WRITEFILE "leaderboard.txt", Position, Names[Position], Totals[Position]
NEXT Position
CLOSEFILE "leaderboard.txt"
OUTPUT "Winner: ", Names[1], Totals[1]`,
      pythonStarter: code`# Keep your completed Bronze and Silver code.

def calculate_totals(scores):
    # Return a 1D list containing one total per competitor.

def bubble_sort_leaderboard(names, totals):
    # Sort totals from highest to lowest.
    # Whenever two totals swap, swap the matching names too.

def save_leaderboard(filename, names, totals):
    # Write rank, name and total on each line.

# Calculate totals, sort both lists, save the report and display the winner.`,
      tasks: [
        {
          title: "1. Create the totals list",
          instruction: "Use calculate_total() for every competitor and append each result to a 1D totals list. Do not use Python’s sum() function.",
        },
        {
          title: "2. Sort the leaderboard",
          instruction: "Use bubble sort to place totals in descending order. Swap the matching names at exactly the same time so each total stays with its competitor.",
        },
        {
          title: "3. Save, test and submit",
          instruction: "Write rank, name and total to leaderboard.txt. Display the winner. Run all three tests below, then submit the completed Python file and its two output text files.",
        },
      ],
      tests: [
        "With the original files, Elena is first with 74 and David is fifth with 48.",
        "If Ana’s four scores are all changed to 20, Ana becomes first with 80.",
        "If two competitors have equal totals, both remain in the file and no name becomes separated from its total.",
      ],
      hints: [
        "Use two nested loops: pass_number controls passes and position compares neighbours.",
        "For descending order, swap when totals[position] < totals[position + 1].",
        "A line can be written as str(rank) + '. ' + names[position] + ' - ' + str(totals[position]) + '\n'.",
      ],
      model: code`def calculate_totals(scores):
    totals = []
    for competitor in range(0, len(scores)):
        totals.append(calculate_total(competitor, scores))
    return totals

def bubble_sort_leaderboard(names, totals):
    for pass_number in range(0, len(totals) - 1):
        for position in range(0, len(totals) - 1 - pass_number):
            if totals[position] < totals[position + 1]:
                temp_total = totals[position]
                totals[position] = totals[position + 1]
                totals[position + 1] = temp_total

                temp_name = names[position]
                names[position] = names[position + 1]
                names[position + 1] = temp_name

def save_leaderboard(filename, names, totals):
    with open(filename, "w", encoding="utf-8") as file:
        for position in range(0, len(names)):
            rank = position + 1
            line = str(rank) + ". " + names[position] + " - " + str(totals[position])
            file.write(line + "\n")

totals = calculate_totals(scores)
bubble_sort_leaderboard(names, totals)
save_leaderboard("leaderboard.txt", names, totals)
print("Winner:", names[0], "with", totals[0], "points")`,
      modelNotes: [
        "Names and totals are parallel lists, so both elements must be swapped together.",
        "The sort is descending because a smaller left value is swapped with the larger value to its right.",
      ],
    },
  ],
};
