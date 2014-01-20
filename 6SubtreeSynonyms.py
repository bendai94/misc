

class Node(object):
	def __init__(self, name):
		self.child = []
		self.name = name

class Tree(object):
	def __init__(self):
		self.root = None

	def addNode(self, name):
		#internal use
		return Node(name)

	def insert(self, root, name):
		#external/internal call to add nodes
		if root == None:
			return self.addNode(name)
		else:
			# shouldn't be used for anything other than 1 node inserts
			raise "Inserting to existing node"

	def insertChild(self, root, name):
		
		if root == None:
			return
		root.child.append(self.addNode(name))

		return root


	def build(self, root, path):
		#external/internal call to build from path
		index = 0
		
		if root == None:
			root = self.addNode(path[index])
			index += 1
		elif root.name == path[index]:
			index += 1

		# index will always be 1 at this point
		if index < len(path):
			
			if path[index].find("|") > 0: #quick and dirty check
				for newnode in self.Explode(path[index].split("|")):
					# insert all the new exploded nodes as children
					self.insertChild(root, newnode)

				index += 1
				# if the explosion has children, keep building
				if len(path) > index:
					for i in xrange(len(root.child)):
						# recurse and continue down the path
						self.build(root.child[i], path[index:])
			

			# if child doesn't exist, createe the first one
			elif len(root.child) == 0:
				self.insertChild(root, path[index])
				self.build(root.child[0], path[index:])
			# if children exist, check which one to go down
			elif len(root.child) > 0:
				found = False # flag
				for child in root.child:
					if child.name == path[index]:
						child = self.build(child, path[index:])
						found = True
				if not found :
				# add a new child and continue the build
					self.insertChild(root, path[index])
					self.build(root.child[len(root.child)-1], path[index:])
					

		return root

	def Explode(self, path):
	    temp = []
	    combo = []
	    output = []
	    if len(path) == 1:
	        output += path
	        
	    if len(path) > 1:

	    	# recurse until only single return
	        temp = self.Explode(path[1:])

	        #combine this node with each thing returned
	        for group in temp:
	            combo.append( path[0] + "-" + group )
	            
	        # builds as shown in Q3
	        # not neccessary, but doesn't hurt to leave in
	        output = temp[:len(path)-1] + combo[:len(path)-1] + temp[len(path)-1:] + combo[len(path)-1:]
	        output.insert(0, path[0] )
	        
	    return output

	def printTree(self, root):
		if root == None:
			pass
		else:
			print root.name
			for child in root.child:
				self.printTree(child)
			
	def TraverseCompare(self, root, path, comp, syns):
		# root = current node looking at
		# path = current path walked down
		# comp = childpath of the node we're looking to match
		try:
			collapsedPath = CollapseTree(self, root)
			comp2 = collapsedPath[collapsedPath[1:].find("/")+1:]
			# comp2 = childpath of current node
		except Exception as e:
			comp2 = ""
			# if it can't be collapsed, assume it won't match

		if comp2 == comp:
			syns.append(path + str(root.name))

		# recurse down the children's paths
		for child in root.child:
			currpath = path + str(root.name) + "/"
			syns = self.TraverseCompare(child, currpath, comp, syns)

		return syns


def Synonym(tree, root, path):
	# non-recursive, root is the root of the whole tree
	parts = []
	parts = SplitPath(path)
	print "Looking For ",
	print path

	# Gets the node we compare against
	node = ClimbTree(tree, root, parts)
	# path of the node we compare against
	try:
		collapsedPath = CollapseTree(tree, node)
		# get a string of the children of the node
		comp = collapsedPath[collapsedPath.rfind("/"):]
	except Exception as e:
		raise Exception("Unable to Collapse children of the Synonyms")	

	syns = []
	# start the recursive call to gather synonyms
	syns = tree.TraverseCompare(root, "", comp, syns)

	for synonym in syns:
		if "/" + synonym == path:
			pass # start location
		else:
			print "/" + synonym
	
def ClimbTree(tree, root, path):
	# recursive, root is just current node
	# just go through a tree to return a specific node for searching
	if root.name == path[0]:
		if len(path) == 1:
			# found it
			return root

		if len(root.child) == 1:
			root = ClimbTree(tree, root.child[0], path[1:])
		elif len(root.child) > 1:
			for child in root.child:
				if child.name == path[1]:
					root = ClimbTree(tree, child, path[1:])

	return root


def SplitPath(path):
	parts = []
	
	parts = path.split("/")

	while "" in parts:
		parts.remove("")

	return parts

def CollapseTree(Tree, root):
	return "/" + str(Collapse(Tree, root)[0])

def Collapse(Tree, root):
	parts = []

	parts.append(root.name)

	if len(root.child) == 0:
		pass # leaf
	elif len(root.child) == 1:
		# single child
		parts += Collapse(tree, root.child[0])
		parts = ["/".join(parts)]

	elif len(root.child) > 1:
		# multiple children
		childrenPath = []

		# recurse to build a path for each child
		for i in xrange(len(root.child)):
			childrenPath += Collapse(tree, root.child[i])

		group = []

		# we may be at a level where an explosion has children
		# so we'll cut those off and save them for rebuilding the path later
		remainingPath = False
		for path in childrenPath:
			if path.find("/") > 0:
				group.append(path[:path.find("/")])
				remainingPath = True
			else:
				group.append(path)

		# group now contains just the nodenames on this level
		# check for explosions
		found = False
		pieces = [] #non combined elements

		# check each node for a hyphen
		for part in group:
			if part.find("-") > 0:
				found = True
			else:
				pieces.append( part )

		if found:
			# explode the non-hypenated nodes,
			# and see if they match the ones we found
			splode = tree.Explode(pieces)
			splode.sort()
			group.sort()
			if splode == group:
				# this was an explosion, so join them with bar
				parts.append( "|".join(pieces) )
				
				# if the exploded nodes had children, re-attach them before returning
				if remainingPath:

					# Check to make sure explosions weren't manual
					for path in childrenPath:
						if childrenPath[0][(childrenPath[0].find("/")+1):] != path[(path.find("/")+1):]:
							raise Exception("Exploded nodes have non-identical children")

					# stick on the rest of the path, now that the explosion is collapsed
					parts.append(childrenPath[0][(childrenPath[0].find("/")+1):])

				
				parts = ["/".join(parts)]

			else:
				# multiple children
				raise Exception("Unable to represent in a single line")

		else:
			# non-exploded multiple children
			raise Exception("Unable to represent in a single line")
	
	return parts



tree = Tree()
root = None

root = tree.build(root, SplitPath("/home/sports|music/misc|favorites"))
# adding an additional leaf in the tree, synonyms are searched anywhere,
# not just on the same level
root = tree.build(root, SplitPath("/home/other/art/misc|favorites"))

try:
	Synonym(tree, root, "/home/sports")
except Exception as e:
	print "Error: " + str(e)

""" OUTPUT

C:\Users\Ben\Documents\GitHub\misc>6SubtreeSynonyms.py
Looking For  /home/sports
/home/music
/home/sports-music
/home/other/art

"""
