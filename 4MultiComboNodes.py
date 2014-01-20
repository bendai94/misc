

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
					self.insertChild(root, newnode)
				index += 1
				# if the explosion has children, keep building
				if len(path) > index:
					for i in xrange(len(root.child)):
						# recurse and continue down the path
						self.build(root.child[i], path[index:])
			

			# if child doesn't exist, go down child
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
			


def SplitPath(path):
	parts = []
	
	parts = path.split("/")

	while "" in parts:
		parts.remove("")

	return parts



tree = Tree()
root = None

root = tree.build(root, SplitPath("/home/sports|music/misc|favorites"))

# Depth first pre-order (root then children)
tree.printTree(root)

""" OUTPUT 

C:\Users\Ben\Documents\GitHub\misc>4MultiComboNodes.py
home
sports
misc
favorites
misc-favorites
music
misc
favorites
misc-favorites
sports-music
misc
favorites
misc-favorites

"""