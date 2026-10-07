/**
 * ============================================================================
 * COURSE: Operating Systems and Systems Programming (25CS2104E)
 * SECTION: 3 | TEAM: 21
 * PROJECT TITLE: Multithreaded Linux Application Using POSIX Threads and Mutexes
 * 
 * TEAM MEMBERS:
 * 1. J. Nanditha (Roll No: 2520030013) - Thread Management (`pthread_create`, `pthread_join`)
 * 2. M. Gayatri  (Roll No: 2520030175) - Mutex Synchronization (`pthread_mutex_lock`, `pthread_mutex_unlock`)
 * ============================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>
#include <stdbool.h>

#define MAX_TASKS 10

/* ANSI colors */
#define RESET   "\033[0m"
#define CYAN    "\033[1;36m"
#define GREEN   "\033[1;32m"
#define YELLOW  "\033[1;33m"
#define RED     "\033[1;31m"
#define BLUE    "\033[1;34m"
#define WHITE   "\033[1;37m"

/* Task structure (NO USER DURATION FIELD) */
typedef struct
{
    int task_id;
    char task_name[50];
    char status[20];
} Task;

/* Global data */
Task tasks[MAX_TASKS];

int total_tasks = 0;
int completed_tasks = 0;

/* Shared resource */
int shared_resource = 0;

/* Mutex */
pthread_mutex_t mutex;


/* Display header */
void display_header()
{
    printf("\n");
    printf(CYAN);
    printf("============================================================\n");
    printf("  Multithreaded Linux Application Using POSIX Threads & Mutexes\n");
    printf("============================================================\n");
    printf(RESET);
}


/* Thread function */
void *process_task(void *arg)
{
    Task *task = (Task *)arg;

    printf("\n");
    printf(BLUE);
    printf("[Thread %lu] ", (unsigned long)pthread_self());
    printf(RESET);

    printf("Task #%d : %s\n",
           task->task_id,
           task->task_name);

    printf(YELLOW);
    printf("    Status : PROCESSING\n");
    printf(RESET);

    /*
     * Simulate real task execution workload.
     */
    usleep((rand() % 400 + 400) * 1000); // 400ms - 800ms real execution delay


    /*
     * Critical Section
     *
     * Multiple threads access the same
     * shared resource, so mutex is required.
     */
    printf(YELLOW);
    printf("    Task #%d requesting shared resource...\n",
           task->task_id);
    printf(RESET);

    pthread_mutex_lock(&mutex);

    printf(RED);
    printf("    Task #%d -> MUTEX LOCKED\n",
           task->task_id);
    printf(RESET);

    printf("    Task #%d updating shared resource...\n",
           task->task_id);

    shared_resource++;

    usleep(300000);

    printf("    Shared resource value = %d\n",
           shared_resource);

    pthread_mutex_unlock(&mutex);

    printf(GREEN);
    printf("    Task #%d -> MUTEX UNLOCKED\n",
           task->task_id);
    printf(RESET);


    /* Mark task completed */
    strcpy(task->status, "COMPLETED");

    pthread_mutex_lock(&mutex);

    completed_tasks++;

    pthread_mutex_unlock(&mutex);


    printf(GREEN);
    printf("    Task #%d : COMPLETED\n",
           task->task_id);
    printf(RESET);

    return NULL;
}


/* Take task input (NO DURATION PROMPT FOR USER) */
void enter_tasks()
{
    printf("\n");
    printf(CYAN);
    printf("---------------- ENTER TASK DETAILS ----------------\n");
    printf(RESET);

    printf("Enter number of tasks (1-%d): ", MAX_TASKS);
    if (scanf("%d", &total_tasks) != 1) {
        total_tasks = 0;
        return;
    }

    if (total_tasks < 1 || total_tasks > MAX_TASKS)
    {
        printf(RED);
        printf("\nInvalid number of tasks!\n");
        printf(RESET);

        total_tasks = 0;
        return;
    }

    for (int i = 0; i < total_tasks; i++)
    {
        tasks[i].task_id = i + 1;

        printf("\n");
        printf(WHITE);
        printf("Task %d\n", i + 1);
        printf(RESET);

        printf("Enter task name: ");
        scanf(" %[^\n]", tasks[i].task_name);

        strcpy(tasks[i].status, "PENDING");
    }

    printf("\n");
    printf(GREEN);
    printf("All tasks added successfully!\n");
    printf(RESET);
}


/* Display tasks */
void display_tasks()
{
    if (total_tasks == 0)
    {
        printf("\n");
        printf(YELLOW);
        printf("No tasks available.\n");
        printf(RESET);
        return;
    }

    printf("\n");
    printf(CYAN);
    printf("==================== TASK LIST ====================\n");
    printf(RESET);

    printf("%-8s %-30s %-15s\n",
           "ID",
           "TASK",
           "STATUS");

    printf("----------------------------------------------------\n");

    for (int i = 0; i < total_tasks; i++)
    {
        printf("%-8d %-30s %-15s\n",
               tasks[i].task_id,
               tasks[i].task_name,
               tasks[i].status);
    }

    printf("----------------------------------------------------\n");
}


/* Start processing */
void start_processing()
{
    if (total_tasks == 0)
    {
        printf("\n");
        printf(YELLOW);
        printf("Please enter tasks first.\n");
        printf(RESET);
        return;
    }

    pthread_t threads[MAX_TASKS];

    completed_tasks = 0;
    shared_resource = 0;

    printf("\n");
    printf(CYAN);
    printf("============================================================\n");
    printf("                STARTING CONCURRENT EXECUTION\n");
    printf("============================================================\n");
    printf(RESET);

    printf("\nCreating %d worker threads...\n", total_tasks);

    /* Create threads */
    for (int i = 0; i < total_tasks; i++)
    {
        int result = pthread_create(
            &threads[i],
            NULL,
            process_task,
            &tasks[i]
        );

        if (result != 0)
        {
            printf(RED);
            printf("Error creating thread for Task #%d\n",
                   tasks[i].task_id);
            printf(RESET);
        }
        else
        {
            printf(GREEN);
            printf("Thread created for Task #%d\n",
                   tasks[i].task_id);
            printf(RESET);
        }
    }

    printf("\n");
    printf(YELLOW);
    printf("All threads are executing concurrently...\n");
    printf(RESET);


    /* Wait for all threads */
    for (int i = 0; i < total_tasks; i++)
    {
        pthread_join(threads[i], NULL);
    }


    printf("\n");
    printf(CYAN);
    printf("============================================================\n");
    printf("                  EXECUTION COMPLETED\n");
    printf("============================================================\n");
    printf(RESET);
}


/* Display final summary */
void display_summary()
{
    if (total_tasks == 0)
    {
        printf("\nNo tasks available.\n");
        return;
    }

    printf("\n");
    printf(CYAN);
    printf("============================================================\n");
    printf("                    EXECUTION SUMMARY\n");
    printf("============================================================\n");
    printf(RESET);

    printf("\n");

    printf("%-8s %-30s %-15s\n",
           "ID",
           "TASK",
           "STATUS");

    printf("------------------------------------------------------------\n");

    for (int i = 0; i < total_tasks; i++)
    {
        printf("%-8d %-30s ",
               tasks[i].task_id,
               tasks[i].task_name);

        if (strcmp(tasks[i].status, "COMPLETED") == 0)
        {
            printf(GREEN);
            printf("%-15s", tasks[i].status);
            printf(RESET);
        }
        else
        {
            printf(YELLOW);
            printf("%-15s", tasks[i].status);
            printf(RESET);
        }

        printf("\n");
    }

    printf("------------------------------------------------------------\n");

    printf("\nTotal Tasks       : %d\n", total_tasks);
    printf("Completed Tasks   : %d\n", completed_tasks);
    printf("Shared Resource   : %d\n", shared_resource);
    printf("Synchronization   : ");
    
    printf(GREEN);
    printf("MUTEX ENABLED\n");
    printf(RESET);

    printf("\n");
    printf(CYAN);
    printf("============================================================\n");
    printf(RESET);
}


/* Main function */
int main()
{
    int choice;
    srand(time(NULL));

    /* Initialize mutex */
    pthread_mutex_init(&mutex, NULL);

    display_header();

    while (1)
    {
        printf("\n");
        printf(WHITE);
        printf("--------------- MAIN MENU ---------------\n");
        printf(RESET);

        printf("1. Enter Tasks\n");
        printf("2. View Tasks\n");
        printf("3. Start Concurrent Processing\n");
        printf("4. View Execution Summary\n");
        printf("5. Exit\n");

        printf("\nEnter your choice: ");
        if (scanf("%d", &choice) != 1) break;

        switch (choice)
        {
            case 1:
                enter_tasks();
                break;

            case 2:
                display_tasks();
                break;

            case 3:
                start_processing();
                break;

            case 4:
                display_summary();
                break;

            case 5:

                printf("\n");
                printf(GREEN);
                printf("Thank you for using the system!\n");
                printf(RESET);

                pthread_mutex_destroy(&mutex);

                return 0;

            default:

                printf("\n");
                printf(RED);
                printf("Invalid choice! Please try again.\n");
                printf(RESET);
        }
    }

    return 0;
}
