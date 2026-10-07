# Multithreaded Linux Application Using POSIX Threads and Mutexes

**Course:** Operating Systems and Systems Programming (25CS2104E)  
**Academic Year:** 2026–27, Term-I  
**Section:** 3 | **Team:** 21  

### Team Members
- **J. Nanditha** (Roll No: 2520030013) - *Thread Creation, Execution & Management (`pthread_create`, `pthread_join`)*
- **M. Gayatri** (Roll No: 2520030175) - *Mutex Synchronization (`pthread_mutex_lock`, `pthread_mutex_unlock`), Task Logic & Integration*

---

## 📌 Project Overview
This project demonstrates concurrent task processing in Linux using POSIX Threads (`pthreads`) and Mutex Synchronization (`pthread_mutex_t`). 
It compares unsynchronized execution (susceptible to race conditions) with mutex-protected critical sections, ensuring data consistency and mutual exclusion across concurrent worker threads.

### 🔑 OS Concepts & APIs Covered
- **Thread Management:** `pthread_create()`, `pthread_join()`, `pthread_exit()`
- **Mutex Synchronization:** `pthread_mutex_init()`, `pthread_mutex_lock()`, `pthread_mutex_unlock()`, `pthread_mutex_destroy()`
- **Concurrency Concepts:** Critical Sections, Race Conditions, Mutual Exclusion, Shared Resource Consistency, Deadlock Prevention.

---

## 📁 Repository Structure
```
multithreaded-posix-app/
├── src/
│   ├── main.c           # C implementation of POSIX threads & mutexes
│   └── Makefile         # GNU Make automation build script
├── web/
│   ├── index.html       # Visualizer Dashboard UI
│   ├── styles.css       # Premium Dark-Mode Glassmorphism Design System
│   └── app.js           # Interactive Thread Simulator & Visualizer Logic
└── README.md            # Documentation & Submission details
```
