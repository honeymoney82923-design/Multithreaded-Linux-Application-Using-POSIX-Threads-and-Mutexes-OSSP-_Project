# Makefile for Multithreaded Linux Application Using POSIX Threads and Mutexes
# Course: 25CS2104E | Section 3 | Team 21

CC = gcc
CFLAGS = -Wall -Wextra -pthread -O2
TARGET = posix_multithread_app

all: $(TARGET)

$(TARGET): main.c
	$(CC) $(CFLAGS) main.c -o $(TARGET)

run-mutex: $(TARGET)
	./$(TARGET) 1

run-nomutex: $(TARGET)
	./$(TARGET) 0

clean:
	rm -f $(TARGET) *.o

.PHONY: all run-mutex run-nomutex clean
