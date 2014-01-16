import sys
import bisect
from hashlib import md5

class ConsistentHash(object):
	# creates a consistent hash ring

	def __init__(self, virtuals=100):

		# how many virtual points each destination has 
		self.virtuals = virtuals
		# array of hash points on the ring 
		self.destinations = []
		# dictionary of the hash points => SQL box to go to
		self.SQLboxes = {}

	def Hash(self, key):
		# internal hash function

		return long(md5(key).hexdigest(), 16)

	def Iterator(self, boxname):
		# internal iterator for virtual points on the ring

		return (self.Hash("%s:%s" % (boxname, i))
			for i in xrange(self.virtuals))

	def AddBox(self, boxname):

		""" 
		create all the virtual points for this box 
		and store them in sorted order in the destinations array
		"""
		for box in self.Iterator(boxname):
			self.SQLboxes[box] = boxname
			bisect.insort(self.destinations, box)

	def Shard(self, userID):
		"""
		hash the userid key, 
		and find the destination box on the ring
		"""
		box = self.Hash(userID)
		start = bisect.bisect(self.destinations, box)
		if start == len(self.destinations):
			start = 0
		return self.SQLboxes[self.destinations[start]]


def PickTarget(userID, *sqlBoxes):
	cr = ConsistentHash(100)
	for sqlBox in sqlBoxes:
		cr.AddBox(sqlBox)

	# returns human-readable output
	return userID + "\t into " + cr.Shard(userID)


"""Quick test

# Tested with python Version 2.6.5, 
# different versions will hash to different targets

print PickTarget("Bob Smith", "Box 1", "Box 2", "Box 3" ,"Box 4")
print
print "Removed Box 3"
print PickTarget("Bob Smith", "Box 1", "Box 2" ,"Box 4")
print 
print "Added Box 3 back, and added a 5th box"
print PickTarget("Bob Smith", "Box 1", "Box 2", "Box 3" ,"Box 4", "Box 5")
print
print "Added a 6th box"
print PickTarget("Bob Smith", "Box 1", "Box 2", "Box 3", "Box 4", "Box 5", "Box 6")
print
print "Removed Box 6"
print PickTarget("Bob Smith", "Box 1", "Box 2", "Box 3" ,"Box 4", "Box 5")
print 
print("completed")

OUTPUT: 

C:\Development\python>BoxPicker.py
Bob Smith        into Box 3

Removed Box 3
Bob Smith        into Box 2

Added Box 3 back, and added a 5th box
Bob Smith        into Box 3

Added a 6th box
Bob Smith        into Box 6

Removed Box 6
Bob Smith        into Box 3

completed

"""