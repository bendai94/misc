import bisect
from hashlib import md5

class ConsistentHash(object):

	def __init__(self, virtuals=100):

		# how many virtual points each destination has 
		self.virtuals = virtuals
		# array of hash points on the ring 
		self.destinations = []
		# dictionary of the hash points => SQL box to go to
		self.SQLboxes = {}

	def Hash(self, key):

		return long(md5(key).hexdigest(), 16)

	def Iterator(self, boxname):

		return (self.Hash("%s:%s" % (boxname, i))
			for i in xrange(self.virtuals))

	def AddBox(self, boxname):

		for box in self.Iterator(boxname):
			if box in self.SQLboxes:
				raise Error("duplicate box names")
			self.SQLboxes[box] = boxname
			bisect.insort(self.destinations, box)

	def DelBox(self, boxname):

		for box in self.Iterator(boxname):
			del self.SQLboxes[box]
			index = bisect.bisect_left(self.destinations, box)
			del self.destinations[index]

	def Shard(self, key):
		box = self.Hash(key)
		start = bisect.bisect(self.destinations, box)
		if start == len(self.destinations):
			start = 0
		return key + "\t into " + self.SQLboxes[self.destinations[start]]


"""Quick test"""

users = ["Robert Smith", "Harry Smith", "Billy Bob", "Mary Anne", "Richard Davis"]

cr = ConsistentHash(100)

cr.AddBox("Box 1")
cr.AddBox("Box 2")
cr.AddBox("Box 3")

for user in users:
	print (cr.Shard(user))

cr.AddBox("Box 4")
print ("\nadded Box 4\n")

for user in users:
	print (cr.Shard(user))

cr.DelBox("Box 2")
print ("\nremoved Box 2\n")

for user in users:
	print (cr.Shard(user))


print("\ncompleted")
